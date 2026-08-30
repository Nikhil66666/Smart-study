from sqlalchemy import Column, Integer, Float, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class StudyPlan(Base):

    __tablename__ = "study_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    study_date = Column(
        Date,
        nullable=False
    )

    study_hours = Column(
        Float,
        nullable=False
    )

    completed = Column(
        Boolean,
        default=False
    )

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id"),
        nullable=False
    )

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Subject relationship
    subject = relationship(
        "Subject",
        back_populates="study_plans"
    )

    # Exam relationship
    exam = relationship(
        "Exam",
        back_populates="study_plans"
    )

    # User relationship
    user = relationship(
        "User"
    )