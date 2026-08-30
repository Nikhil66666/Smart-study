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
# Send OTP
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
            detail="Email already registered"
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
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )

    db.add(pending)
    db.commit()

    send_otp(data.email, otp)

    return {
        "message": "OTP sent successfully"
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
            detail="OTP request not found"
        )

    if datetime.utcnow() > pending_user.expires_at:

        db.delete(pending_user)
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    if not verify_password(
        data.otp,
        pending_user.otp
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
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
        "message": "Account verified successfully"
    }
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
            detail="Invalid email or password"
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
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
            detail="Email not found"
        )

    otp = generate_otp()

    user.otp = hash_password(otp)
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)

    db.commit()

    send_otp(user.email, otp)

    return {
        "message": "OTP sent successfully"
    }
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

    if datetime.utcnow() > user.otp_expiry:
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    if not verify_password(
        data.otp,
        user.otp
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    user.password = hash_password(
        data.new_password
    )

    user.otp = None
    user.otp_expiry = None

    db.commit()

    return {
        "message": "Password updated successfully"
    }