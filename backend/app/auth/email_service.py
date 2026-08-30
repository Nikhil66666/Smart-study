import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_otp(email: str, otp: str):
    email_address = os.getenv("EMAIL_ADDRESS")
    email_password = os.getenv("EMAIL_PASSWORD")

    print(f"[OTP Service] Generated OTP {otp} for {email}")

    if not email_address or not email_password:
        print("[Email Service Warning] EMAIL_ADDRESS or EMAIL_PASSWORD not set in environment variables.")
        raise Exception("Email configuration missing on server (EMAIL_ADDRESS / EMAIL_PASSWORD)")

    message = MIMEText(f"""Hello,

Your verification OTP for Smart Study Scheduler is:

    {otp}

This code is valid for 5 minutes. Please do not share it with anyone.

Best regards,
Smart Study Team
""")

    message["Subject"] = f"Your Smart Study OTP: {otp}"
    message["From"] = email_address
    message["To"] = email

    # Try SMTP with TLS (Port 587) first, fallback to SSL (Port 465)
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
            server.starttls()
            server.login(email_address, email_password)
            server.send_message(message)
            print(f"[Email Service] OTP successfully sent via port 587 to {email}")
            return
    except Exception as e587:
        print(f"[Email Service] Port 587 failed ({e587}), trying Port 465 SSL...")
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
                server.login(email_address, email_password)
                server.send_message(message)
                print(f"[Email Service] OTP successfully sent via port 465 to {email}")
                return
        except Exception as e465:
            print(f"[Email Service Error] Failed to send email via 465: {e465}")
            raise Exception(f"Failed to send email: {e465}")