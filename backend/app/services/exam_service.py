from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.exam import Exam

from app.models.study_plan import StudyPlan
from app.models.subject import Subject



def create_exam(db: Session, current_user, data):

    exam = Exam(

        exam_name=data.exam_name,

        exam_date=data.exam_date,

        target_score=data.target_score,

        daily_study_hours=data.daily_study_hours,

        user_id=current_user.id

    )

    db.add(exam)

    db.commit()

    db.refresh(exam)

    return exam


def get_my_exams(db: Session, current_user):

    print("Current User ID:", current_user.id)
    print("Current User Email:", current_user.email)

    exams = db.query(Exam).filter(
        Exam.user_id == current_user.id
    ).all()

    print("Exam Count:", len(exams))
    print(exams)

    return exams

def delete_exam(
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

    # Get all subjects of this exam
    subjects = db.query(Subject).filter(
        Subject.exam_id == exam.id
    ).all()

    # Delete study plans of every subject
    for subject in subjects:

        db.query(StudyPlan).filter(
            StudyPlan.subject_id == subject.id
        ).delete()

    # Delete subjects
    db.query(Subject).filter(
        Subject.exam_id == exam.id
    ).delete()

    # Delete exam
    db.delete(exam)

    db.commit()

    return {
        "message": "Exam deleted successfully"
    }