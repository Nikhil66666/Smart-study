from datetime import date

from pydantic import BaseModel


class ExamCreate(BaseModel):

    exam_name: str

    exam_date: date

    target_score: int

    daily_study_hours: float


class ExamResponse(BaseModel):

    id: int

    exam_name: str

    exam_date: date

    target_score: int

    daily_study_hours: float

    class Config:
        from_attributes = True