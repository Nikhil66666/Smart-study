from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.auth.jwt_handler import get_current_user

from app.models.user import User

from app.services.dashboard_service import (
    get_dashboard_summary,
    get_subject_progress
)


router = APIRouter(

    prefix="/dashboard",

    tags=["Dashboard"]

)


@router.get("/summary")
def get_dashboard_summary_api(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_dashboard_summary(

        db,

        current_user

    )
@router.get("/subject-progress")
def get_subject_progress_api(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_subject_progress(
        db,
        current_user
    )