from typing import Optional

from fastapi import APIRouter, Depends, Query

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.auth.jwt_handler import get_current_user

from app.models.user import User

from app.schemas.study_plan_schema import (
    GenerateStudyPlanRequest
)

from app.services.study_plan_service import (
    generate_study_plan,
    get_my_plan,
    complete_study_plan,
    get_study_plan_summary
)

router = APIRouter(

    prefix="/study-plan",

    tags=["Study Plan"]

)


@router.post("/generate")
def generate_plan_api(

    data: GenerateStudyPlanRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return generate_study_plan(

        db,

        current_user,

        data

    )


@router.get("/my-plan")
def get_my_plan_api(

    exam_id: Optional[int] = Query(
        default=None
    ),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_my_plan(

        db,

        current_user,

        exam_id

    )
@router.put("/complete/{plan_id}")
def complete_plan_api(

    plan_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    return complete_study_plan(

        db,

        current_user,

        plan_id

    )
@router.get("/summary/{exam_id}")
def get_study_plan_summary_api(

    exam_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_study_plan_summary(

        db,

        current_user,

        exam_id

    )