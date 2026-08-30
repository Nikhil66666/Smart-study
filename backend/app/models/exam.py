from sqlalchemy import Column, Integer, String, Date, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)

    exam_name = Column(String(150), nullable=False)

    exam_date = Column(Date, nullable=False)

    target_score = Column(Integer, nullable=False)

    daily_study_hours = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User")
    subjects = relationship(
    "Subject",
    back_populates="exam"
    
)
    study_plans = relationship(
    "StudyPlan",
    back_populates="exam",
    cascade="all, delete-orphan"
)