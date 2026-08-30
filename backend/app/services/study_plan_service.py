from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.exam import Exam
from app.models.subject import Subject
from app.models.study_plan import StudyPlan


def difficulty_score(level: str):

    level = level.lower()

    if level == "easy":
        return 1

    elif level == "medium":
        return 2

    elif level == "hard":
        return 3

    return 1


def generate_study_plan(
    db: Session,
    current_user,
    data
):

    # --------------------------------------------------
    # 1. Find user's exam
    # --------------------------------------------------

    exam = db.query(Exam).filter(
        Exam.id == data.exam_id,
        Exam.user_id == current_user.id
    ).first()

    if exam is None:

        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )


    # --------------------------------------------------
    # 2. Get subjects
    # --------------------------------------------------

    subjects = db.query(Subject).filter(
        Subject.exam_id == exam.id
    ).all()

    if not subjects:

        raise HTTPException(
            status_code=400,
            detail="No subjects found for this exam."
        )


    # --------------------------------------------------
    # 3. Calculate remaining days
    # --------------------------------------------------

    today = date.today()

    remaining_days = (
        exam.exam_date - today
    ).days

    if remaining_days <= 0:

        raise HTTPException(
            status_code=400,
            detail="Exam date must be in the future."
        )


    # --------------------------------------------------
    # 4. Calculate hours
    # --------------------------------------------------

    total_required_hours = sum(
        float(subject.total_hours)
        for subject in subjects
    )

    total_available_hours = (
        remaining_days *
        float(exam.daily_study_hours)
    )


    # --------------------------------------------------
    # 5. Delete ONLY this exam's old plan
    # --------------------------------------------------

    db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.exam_id == exam.id
    ).delete(
        synchronize_session=False
    )

    db.commit()


    # --------------------------------------------------
    # 6. Store remaining hours
    # --------------------------------------------------

    remaining = {}

    for subject in subjects:

        remaining[subject.id] = float(
            subject.total_hours
        )


    # --------------------------------------------------
    # 7. Generate daily schedule
    # --------------------------------------------------

    current_day = today

    total_scheduled_hours = 0


    while current_day < exam.exam_date:

        unfinished = []

        total_weight = 0


        # Find unfinished subjects
        for subject in subjects:

            if remaining[subject.id] > 0:

                weight = (
                    subject.priority
                    +
                    difficulty_score(
                        subject.difficulty
                    )
                )

                unfinished.append(
                    (
                        subject,
                        weight
                    )
                )

                total_weight += weight


        # Everything completed
        if not unfinished:
            break


        available_hours = float(
            exam.daily_study_hours
        )


        # --------------------------------------------------
        # Allocate today's hours
        # --------------------------------------------------

        for subject, weight in unfinished:

            allocated = (
                weight / total_weight
            ) * available_hours

            allocated = round(
                allocated,
                2
            )


            # Don't allocate more than required
            if allocated > remaining[subject.id]:

                allocated = round(
                    remaining[subject.id],
                    2
                )


            if allocated <= 0:
                continue


            plan = StudyPlan(

                study_date=current_day,

                study_hours=allocated,

                completed=False,

                subject_id=subject.id,

                exam_id=exam.id,

                user_id=current_user.id
            )

            db.add(plan)


            remaining[subject.id] -= allocated

            remaining[subject.id] = max(
                0,
                round(
                    remaining[subject.id],
                    2
                )
            )


            total_scheduled_hours += allocated


        current_day += timedelta(days=1)


    # --------------------------------------------------
    # 8. Save
    # --------------------------------------------------

    db.commit()


    # --------------------------------------------------
    # 9. Statistics
    # --------------------------------------------------

    total_scheduled_hours = round(
        total_scheduled_hours,
        2
    )

    total_required_hours = round(
        total_required_hours,
        2
    )

    total_available_hours = round(
        total_available_hours,
        2
    )

    uncovered_hours = round(
        max(
            0,
            total_required_hours
            -
            total_scheduled_hours
        ),
        2
    )


    # --------------------------------------------------
    # 10. Status
    # --------------------------------------------------

    if uncovered_hours == 0:

        status = "Complete"

        message = (
            "Smart Study Plan Generated Successfully"
        )

    else:

        status = "Limited"

        message = (
            "Study plan generated with limited "
            "available study time."
        )


    return {

        "message": message,

        "status": status,

        "exam_id": exam.id,

        "exam_name": exam.exam_name,

        "exam_date": exam.exam_date,

        "remaining_days": remaining_days,

        "total_required_hours":
            total_required_hours,

        "total_available_hours":
            total_available_hours,

        "total_scheduled_hours":
            round(
                total_scheduled_hours,
                2
            ),

        "uncovered_hours":
            uncovered_hours
    }


def get_my_plan(
    db: Session,
    current_user,
    exam_id=None
):

    query = (
        db.query(
            StudyPlan,
            Subject.subject_name
        )
        .join(
            Subject,
            StudyPlan.subject_id == Subject.id
        )
        .filter(
            StudyPlan.user_id == current_user.id
        )
    )

    if exam_id is not None:

        query = query.filter(
            StudyPlan.exam_id == exam_id
        )

    results = query.order_by(
        StudyPlan.study_date.asc(),
        StudyPlan.id.asc()
    ).all()

    plans = []

    for plan, subject_name in results:

        plans.append({

            "id": plan.id,

            "study_date":
                plan.study_date,

            "study_hours":
                plan.study_hours,

            "completed":
                plan.completed,

            "subject_id":
                plan.subject_id,

            "subject_name":
                subject_name,

            "exam_id":
                plan.exam_id,

            "user_id":
                plan.user_id

        })

    return plans

def complete_study_plan(
    db: Session,
    current_user,
    plan_id: int
):

    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    ).first()

    if plan is None:

        raise HTTPException(
            status_code=404,
            detail="Study plan not found"
        )

    plan.completed = True

    db.commit()

    db.refresh(plan)

    return {
        "message": "Study session completed successfully",
        "plan": plan
    }
def get_study_plan_summary(
    db: Session,
    current_user,
    exam_id: int
):

    # --------------------------------------------------
    # 1. Verify that the exam belongs to the user
    # --------------------------------------------------

    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.user_id == current_user.id
    ).first()

    if exam is None:

        raise HTTPException(
            status_code=404,
            detail="Exam not found"
        )


    # --------------------------------------------------
    # 2. Get all subjects for this exam
    # --------------------------------------------------

    subjects = db.query(Subject).filter(
        Subject.exam_id == exam_id
    ).all()

    if not subjects:

        raise HTTPException(
            status_code=400,
            detail="No subjects found for this exam."
        )


    # --------------------------------------------------
    # 3. Calculate required hours
    # --------------------------------------------------

    total_required_hours = sum(
        float(subject.total_hours)
        for subject in subjects
    )


    # --------------------------------------------------
    # 4. Get study-plan entries for this exam
    # --------------------------------------------------

    plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.exam_id == exam_id
    ).all()


    # --------------------------------------------------
    # 5. Calculate scheduled hours
    # --------------------------------------------------

    total_scheduled_hours = sum(
        float(plan.study_hours)
        for plan in plans
    )


    # --------------------------------------------------
    # 6. Calculate completed hours
    # --------------------------------------------------

    completed_hours = sum(
        float(plan.study_hours)
        for plan in plans
        if plan.completed
    )


    # --------------------------------------------------
    # 7. Calculate remaining hours
    # --------------------------------------------------

    remaining_hours = max(
        0,
        total_scheduled_hours
        - completed_hours
    )


    # --------------------------------------------------
    # 8. Calculate uncovered hours
    # --------------------------------------------------

    uncovered_hours = max(
        0,
        total_required_hours
        - total_scheduled_hours
    )


    # --------------------------------------------------
    # 9. Calculate progress percentage
    # --------------------------------------------------

    if total_required_hours > 0:

        progress_percentage = (
            completed_hours
            / total_required_hours
        ) * 100

    else:

        progress_percentage = 0


    progress_percentage = round(
        progress_percentage,
        2
    )


    # --------------------------------------------------
    # 10. Return summary
    # --------------------------------------------------

    return {

        "exam_id": exam.id,

        "exam_name": exam.exam_name,

        "total_required_hours":
            round(
                total_required_hours,
                2
            ),

        "total_scheduled_hours":
            round(
                total_scheduled_hours,
                2
            ),

        "completed_hours":
            round(
                completed_hours,
                2
            ),

        "remaining_hours":
            round(
                remaining_hours,
                2
            ),

        "uncovered_hours":
            round(
                uncovered_hours,
                2
            ),

        "progress_percentage":
            progress_percentage,

        "total_sessions":
            len(plans),

        "completed_sessions":
            sum(
                1
                for plan in plans
                if plan.completed
            ),

        "pending_sessions":
            sum(
                1
                for plan in plans
                if not plan.completed
            )
    }