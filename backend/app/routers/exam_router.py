from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.auth.jwt_handler import get_current_user

from app.models.user import User

from app.schemas.exam_schema import ExamCreate

from app.services.exam_service import create_exam
from app.services.exam_service import get_my_exams

from app.services.exam_service import delete_exam

router = APIRouter(

    prefix="/exam",

    tags=["Exam"]

)


@router.post("/create")
def create_exam_api(

    data: ExamCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return create_exam(

        db,

        current_user,

        data

    )


@router.get("/my-exams")
def get_my_exam_api(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return get_my_exams(

        db,

        current_user

    )

@router.delete("/delete/{exam_id}")
def delete_exam_api(

    exam_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return delete_exam(

        db,

        current_user,

        exam_id

    )