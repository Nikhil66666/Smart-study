import os
import smtplib

from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()


EMAIL = os.getenv("EMAIL_ADDRESS")
PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_otp(email, otp):

    message = MIMEText(f"""

Your OTP for Smart Study Scheduler

OTP : {otp}

Valid for 5 minutes.

""")

    message["Subject"] = "Smart Study Scheduler OTP"

    message["From"] = EMAIL

    message["To"] = email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:

        server.starttls()

        server.login(EMAIL, PASSWORD)

        server.send_message(message)