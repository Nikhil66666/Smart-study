from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.schemas.auth_schema import ForgotPasswordRequest
from app.schemas.auth_schema import ResetPasswordRequest
from app.models.user import User
from app.models.pending_user import PendingUser
from app.schemas.auth_schema import LoginRequest
from app.auth.jwt_handler import create_access_token
from app.schemas.auth_schema import (
    SendOTPRequest,
    VerifyOTPRequest
)

from app.auth.otp_service import generate_otp
from app.auth.email_service import send_otp

from app.utils.security import (
    hash_password,
    verify_password
)


# -----------------------------
# Send OTP for Registration
# -----------------------------
def send_signup_otp(
    db: Session,
    data: SendOTPRequest
):

    existing = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered. Please log in."
        )

    db.query(PendingUser).filter(
        PendingUser.email == data.email
    ).delete()

    otp = generate_otp()

    pending = PendingUser(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        otp=hash_password(otp),
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    )

    db.add(pending)
    db.commit()

    print(f"\n==========================================")
    print(f"[OTP GENERATED] User: {data.email} | OTP Code: {otp}")
    print(f"==========================================\n")

    email_sent = False
    try:
        send_otp(data.email, otp)
        email_sent = True
    except Exception as e:
        print(f"[Email Delivery Warning] Could not send via Gmail SMTP: {e}")

    return {
        "message": "OTP sent successfully to your email!" if email_sent else f"OTP generated! (Verification Code: {otp})",
        "email": data.email,
        "otp": otp,
    }


# -----------------------------
# Verify OTP
# -----------------------------
def verify_signup_otp(
    db: Session,
    data: VerifyOTPRequest
):

    pending_user = db.query(PendingUser).filter(
        PendingUser.email == data.email
    ).first()

    if not pending_user:
        raise HTTPException(
            status_code=404,
            detail="No pending registration found for this email. Please register again."
        )

    if datetime.utcnow() > pending_user.expires_at:
        db.delete(pending_user)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new one."
        )

    if not verify_password(data.otp, pending_user.otp):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please check the 6-digit code and try again."
        )

    new_user = User(
        name=pending_user.name,
        email=pending_user.email,
        password=pending_user.password
    )

    db.add(new_user)
    db.delete(pending_user)
    db.commit()

    return {
        "message": "Account verified and created successfully! You can now log in."
    }


# -----------------------------
# User Login
# -----------------------------
def login_user(
    db: Session,
    data: LoginRequest
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please check your credentials."
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please check your credentials."
        )

    access_token = create_access_token(
        data={
            "sub": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -----------------------------
# Forgot Password
# -----------------------------
def forgot_password(
    db: Session,
    data: ForgotPasswordRequest
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email address."
        )

    otp = generate_otp()

    user.otp = hash_password(otp)
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=15)

    db.commit()

    print(f"\n==========================================")
    print(f"[RESET OTP GENERATED] User: {user.email} | OTP Code: {otp}")
    print(f"==========================================\n")

    email_sent = False
    try:
        send_otp(user.email, otp)
        email_sent = True
    except Exception as e:
        print(f"[Email Delivery Warning] Could not send via Gmail SMTP: {e}")

    return {
        "message": "Reset OTP sent to your email!" if email_sent else f"Reset OTP generated! (Verification Code: {otp})"
    }


# -----------------------------
# Reset Password
# -----------------------------
def reset_password(
    db: Session,
    data: ResetPasswordRequest
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not user.otp_expiry or datetime.utcnow() > user.otp_expiry:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new one."
        )

    if not verify_password(data.otp, user.otp):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP code."
        )

    user.password = hash_password(data.new_password)
    user.otp = None
    user.otp_expiry = None

    db.commit()

    return {
        "message": "Password updated successfully. You can now log in with your new password."
    }