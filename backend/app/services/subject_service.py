from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.subject import Subject
from app.models.exam import Exam


def create_subject(
    db: Session,
    current_user,
    data
):

    exam = db.query(Exam).filter(
        Exam.id == data.exam_id,
        Exam.user_id == current_user.id
    ).first()

    if exam is None:

        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    subject = Subject(

        subject_name=data.subject_name,

        difficulty=data.difficulty,

        priority=data.priority,

        total_hours=data.total_hours,

        exam_id=data.exam_id

    )

    db.add(subject)

    db.commit()

    db.refresh(subject)

    return subject


def get_subjects(
    db: Session,
    current_user,
    exam_id: int
):

    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.user_id == current_user.id
    ).first()

    if exam is None:

        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )

    return db.query(Subject).filter(
        Subject.exam_id == exam_id
    ).all()

def update_subject(
    db: Session,
    current_user,
    subject_id: int,
    data
):

    subject = (
        db.query(Subject)
        .join(Exam)
        .filter(
            Subject.id == subject_id,
            Exam.user_id == current_user.id
        )
        .first()
    )

    if subject is None:

        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():

        setattr(subject, key, value)

    db.commit()

    db.refresh(subject)

    return subject

def delete_subject(
    db: Session,
    current_user,
    subject_id: int
):

    subject = (
        db.query(Subject)
        .join(Exam)
        .filter(
            Subject.id == subject_id,
            Exam.user_id == current_user.id
        )
        .first()
    )

    if subject is None:

        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    db.delete(subject)

    db.commit()

    return {
        "message": "Subject deleted successfully"
    }
def get_my_subjects(
    db: Session,
    current_user
):

    subjects = (
        db.query(Subject)
        .join(Exam)
        .filter(
            Exam.user_id == current_user.id
        )
        .all()
    )

    return subjects