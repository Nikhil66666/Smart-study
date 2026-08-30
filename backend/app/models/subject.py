from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)

    subject_name = Column(String(100), nullable=False)

    difficulty = Column(String(20), nullable=False)

    priority = Column(Integer, nullable=False)

    total_hours = Column(Float, nullable=False)

    completed = Column(Boolean, default=False)

    exam_id = Column(
        Integer,
        ForeignKey("exams.id")
    )

    exam = relationship(
        "Exam",
        back_populates="subjects"
    )
    
    study_plans = relationship(
    "StudyPlan",
    back_populates="subject",
    cascade="all, delete-orphan"
)