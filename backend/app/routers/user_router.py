from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.jwt_handler import get_current_user

from app.models.user import User

from app.services.user_service import get_all_users

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def read_users(
    db: Session = Depends(get_db)
):
    return get_all_users(db)


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }