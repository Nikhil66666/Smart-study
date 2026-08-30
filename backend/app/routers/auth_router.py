from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.auth_schema import ForgotPasswordRequest
from app.schemas.auth_schema import ResetPasswordRequest

from app.services.auth_service import forgot_password
from app.services.auth_service import reset_password
from app.schemas.auth_schema import SendOTPRequest
from app.schemas.auth_schema import LoginRequest
from app.services.auth_service import login_user
from app.services.auth_service import send_signup_otp
from app.schemas.auth_schema import VerifyOTPRequest
from app.services.auth_service import verify_signup_otp

router = APIRouter(

    prefix="/auth",

    tags=["Authentication"]

)


@router.post("/send-otp")
def send_otp_api(

    data: SendOTPRequest,

    db: Session = Depends(get_db)

):

    return send_signup_otp(db, data)

@router.post("/verify-otp")
def verify_otp_api(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    return verify_signup_otp(db, data)

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    return login_user(db, data)

@router.post("/forgot-password")
def forgot_password_api(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return forgot_password(db, data)


@router.post("/reset-password")
def reset_password_api(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return reset_password(db, data)


@router.get("/debug-users")
def debug_list_users(db: Session = Depends(get_db)):
    """Debug: list registered users (email only, no passwords)."""
    from app.models.user import User
    users = db.query(User).all()
    return {
        "total_users": len(users),
        "users": [{"id": u.id, "email": u.email, "name": u.name} for u in users]
    }