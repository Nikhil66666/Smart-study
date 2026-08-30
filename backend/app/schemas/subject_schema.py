from pydantic import BaseModel
from typing import Optional

class SubjectCreate(BaseModel):

    subject_name: str

    difficulty: str

    priority: int

    total_hours: float

    exam_id: int

class SubjectUpdate(BaseModel):

    subject_name: Optional[str] = None

    difficulty: Optional[str] = None

    priority: Optional[int] = None

    total_hours: Optional[float] = None

    completed: Optional[bool] = None