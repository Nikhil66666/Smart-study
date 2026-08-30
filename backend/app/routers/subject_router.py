from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.auth.jwt_handler import get_current_user
from app.schemas.subject_schema import SubjectUpdate
from app.models.user import User

from app.schemas.subject_schema import SubjectCreate

from app.services.subject_service import (
    create_subject,
    get_subjects,
    update_subject,
    delete_subject,
    get_my_subjects
)

router = APIRouter(

    prefix="/subject",

    tags=["Subject"]

)


@router.post("/create")
def create_subject_api(

    data: SubjectCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return create_subject(

        db,

        current_user,

        data

    )

@router.get("/my-subjects")
def get_my_subjects_api(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return get_my_subjects(

        db,

        current_user

    )

@router.get("/{exam_id}")
def get_subjects_api(

    exam_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return get_subjects(

        db,

        current_user,

        exam_id

    )

@router.put("/update/{subject_id}")
def update_subject_api(

    subject_id: int,

    data: SubjectUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return update_subject(

        db,

        current_user,

        subject_id,

        data

    )

@router.delete("/delete/{subject_id}")
def delete_subject_api(

    subject_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return delete_subject(

        db,

        current_user,

        subject_id

    )