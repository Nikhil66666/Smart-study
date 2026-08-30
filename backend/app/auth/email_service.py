import os
import json
import urllib.request
import urllib.error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_via_resend(api_key: str, to_email: str, otp: str) -> tuple[bool, str]:
    """Send email via Resend HTTPS REST API (Port 443 - never blocked by cloud hosts)."""
    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
            "User-Agent": "SmartStudy/1.0"
        }
        payload = {
            "from": "Smart Study <onboarding@resend.dev>",
            "to": [to_email.strip()],
            "subject": f"Smart Study – Your Verification OTP: {otp}",
            "html": f"""
            <div style="font-family:Arial,sans-serif;background:#0d1120;color:#f9fafb;padding:32px;">
              <div style="max-width:420px;margin:auto;background:#111827;border-radius:16px;padding:32px;border:1px solid rgba(168,85,247,0.3);">
                <h2 style="color:#a855f7;margin-bottom:8px;">Smart Study</h2>
                <p style="color:#9ca3af;font-size:14px;">Your verification code is:</p>
                <div style="background:#1f2937;border-radius:12px;padding:20px;text-align:center;margin:20px 0;letter-spacing:12px;">
                  <span style="font-size:2.2rem;font-weight:900;color:#a855f7;">{otp}</span>
                </div>
                <p style="color:#6b7280;font-size:13px;">Valid for 15 minutes. Do not share this code.</p>
              </div>
            </div>
            """
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=12) as resp:
            resp_body = resp.read().decode("utf-8")
            print(f"[Email Service] ✅ Resend response ({resp.status}): {resp_body}")
            return True, f"Sent via Resend (status {resp.status})"
    except urllib.error.HTTPError as he:
        error_detail = he.read().decode("utf-8")
        print(f"[Email Service Error] Resend HTTP {he.code}: {error_detail}")
        return False, f"Resend API Error {he.code}: {error_detail}"
    except Exception as e:
        print(f"[Email Service Warning] Resend connection error: {e}")
        return False, f"Resend Exception: {str(e)}"

def send_otp(email: str, otp: str):
    resend_key = os.getenv("RESEND_API_KEY")
    resend_error = None

    # 1. First priority: Resend HTTP API (Port 443)
    if resend_key:
        success, msg = send_via_resend(resend_key, email, otp)
        if success:
            return
        resend_error = msg

    # 2. Second priority: Standard Gmail SMTP (if running locally or server has open ports)
    email_address = os.getenv("EMAIL_ADDRESS")
    email_password = os.getenv("EMAIL_PASSWORD")

    if not email_address or not email_password:
        if resend_error:
            raise Exception(f"Resend delivery failed: {resend_error}")
        raise Exception("EMAIL_ADDRESS or EMAIL_PASSWORD env variables are not set on the server.")

    print(f"[Email] Attempting fallback to Gmail SMTP for {email}...")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Smart Study – Your OTP Code: {otp}"
    msg["From"] = email_address
    msg["To"] = email

    text_body = f"Hello,\n\nYour verification code for Smart Study is: {otp}\n\nValid for 15 minutes.\n– Smart Study Team"
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;background:#0d1120;color:#f9fafb;padding:32px;">
      <div style="max-width:420px;margin:auto;background:#111827;border-radius:16px;padding:32px;border:1px solid rgba(168,85,247,0.3);">
        <h2 style="color:#a855f7;margin-bottom:8px;">Smart Study</h2>
        <p style="color:#9ca3af;font-size:14px;">Your verification code is:</p>
        <div style="background:#1f2937;border-radius:12px;padding:20px;text-align:center;margin:20px 0;letter-spacing:12px;">
          <span style="font-size:2.2rem;font-weight:900;color:#a855f7;">{otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">Valid for 15 minutes. Do not share this code.</p>
      </div>
    </body></html>
    """

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    # Try TLS Port 587
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=8) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(email_address, email_password)
            server.send_message(msg)
            print(f"[Email] ✅ OTP sent via port 587 to {email}")
            return
    except Exception as e587:
        print(f"[Email] Port 587 failed: {e587}")

    # Try SSL Port 465
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=8) as server:
            server.login(email_address, email_password)
            server.send_message(msg)
            print(f"[Email] ✅ OTP sent via port 465 to {email}")
            return
    except Exception as e465:
        print(f"[Email] Port 465 failed: {e465}")
        detail = f"Resend Error: {resend_error} | SMTP Error: {e465}" if resend_error else f"SMTP ports blocked ({e465})"
        raise Exception(detail)