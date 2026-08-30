import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_otp(email: str, otp: str):
    email_address = os.getenv("EMAIL_ADDRESS")
    email_password = os.getenv("EMAIL_PASSWORD")

    if not email_address or not email_password:
        raise Exception(
            f"EMAIL_ADDRESS or EMAIL_PASSWORD env variables are not set on the server. "
            f"EMAIL_ADDRESS={'SET' if email_address else 'MISSING'}, "
            f"EMAIL_PASSWORD={'SET' if email_password else 'MISSING'}"
        )

    print(f"[Email] Attempting to send OTP to {email} from {email_address}")

    # Build a nice HTML + plain text email
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Smart Study – Your OTP Code: {otp}"
    msg["From"] = email_address
    msg["To"] = email

    text_body = f"""Hello,

Your verification code for Smart Study is:

    {otp}

This code is valid for 15 minutes.
Do not share it with anyone.

– Smart Study Team
"""

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

    last_error = None

    # Try TLS Port 587
    try:
        print(f"[Email] Trying Gmail SMTP TLS port 587...")
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(email_address, email_password)
            server.send_message(msg)
            print(f"[Email] ✅ OTP sent via port 587 to {email}")
            return
    except Exception as e:
        last_error = e
        print(f"[Email] Port 587 failed: {type(e).__name__}: {e}")

    # Fallback: Try SSL Port 465
    try:
        print(f"[Email] Trying Gmail SMTP SSL port 465...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
            server.ehlo()
            server.login(email_address, email_password)
            server.send_message(msg)
            print(f"[Email] ✅ OTP sent via port 465 to {email}")
            return
    except Exception as e:
        last_error = e
        print(f"[Email] Port 465 failed: {type(e).__name__}: {e}")

    raise Exception(
        f"Gmail SMTP failed on both ports 587 and 465. "
        f"Last error: {type(last_error).__name__}: {last_error}. "
        f"Check that EMAIL_ADDRESS and EMAIL_PASSWORD are correct and that Gmail App Password is enabled."
    )