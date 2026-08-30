from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.exam import Exam
from app.models.subject import Subject
from app.models.study_plan import StudyPlan


def get_dashboard_summary(
    db: Session,
    current_user
):

    # ---------------------------------------------
    # Total Exams
    # ---------------------------------------------

    total_exams = db.query(Exam).filter(
        Exam.user_id == current_user.id
    ).count()


    # ---------------------------------------------
    # Total Subjects
    # ---------------------------------------------

    total_subjects = (
        db.query(Subject)
        .join(Exam)
        .filter(
            Exam.user_id == current_user.id
        )
        .count()
    )


    # ---------------------------------------------
    # Today's Study Hours
    # ---------------------------------------------

    today = date.today()

    today_plans = (
        db.query(StudyPlan)
        .filter(
            StudyPlan.user_id == current_user.id,
            StudyPlan.study_date == today
        )
        .all()
    )


    today_study_hours = sum(
        float(plan.study_hours)
        for plan in today_plans
    )


    # ---------------------------------------------
    # Today's Completed Hours
    # ---------------------------------------------

    completed_today_hours = sum(
        float(plan.study_hours)
        for plan in today_plans
        if plan.completed
    )


    # ---------------------------------------------
    # Total Required Hours
    # ---------------------------------------------

    total_required_hours = (
        db.query(
            func.coalesce(
                func.sum(Subject.total_hours),
                0
            )
        )
        .join(Exam)
        .filter(
            Exam.user_id == current_user.id
        )
        .scalar()
    )


    # ---------------------------------------------
    # Total Completed Hours
    # ---------------------------------------------

    completed_hours = (
        db.query(
            func.coalesce(
                func.sum(StudyPlan.study_hours),
                0
            )
        )
        .filter(
            StudyPlan.user_id == current_user.id,
            StudyPlan.completed == True
        )
        .scalar()
    )


    # ---------------------------------------------
    # Overall Progress
    # ---------------------------------------------

    if total_required_hours > 0:

        overall_progress = (
            float(completed_hours)
            / float(total_required_hours)
        ) * 100

    else:

        overall_progress = 0


    overall_progress = round(
        overall_progress,
        2
    )

    study_streak = calculate_study_streak(
      db,
        current_user
    )
    # ---------------------------------------------
    # Return Dashboard Summary
    # ---------------------------------------------

    return {

        "total_exams":
            total_exams,

        "total_subjects":
            total_subjects,

        "today_study_hours":
            round(
                today_study_hours,
                2
            ),

        "completed_today_hours":
            round(
                completed_today_hours,
                2
            ),

        "total_required_hours":
            round(
                float(total_required_hours),
                2
            ),

        "completed_hours":
            round(
                float(completed_hours),
                2
            ),

        "overall_progress":
            overall_progress,

            "study_streak":
             study_streak

    }
def calculate_study_streak(
    db: Session,
    current_user
):

    completed_plans = (
        db.query(StudyPlan.study_date)
        .filter(
            StudyPlan.user_id == current_user.id,
            StudyPlan.completed == True
        )
        .distinct()
        .order_by(
            StudyPlan.study_date.desc()
        )
        .all()
    )

    if not completed_plans:
        return 0

    completed_dates = [
        row[0]
        for row in completed_plans
    ]

    today = date.today()

    # If the user hasn't studied today,
    # allow the streak to start from yesterday.
    if completed_dates[0] == today:

        current_date = today

    elif completed_dates[0] == today.fromordinal(
        today.toordinal() - 1
    ):

        current_date = today.fromordinal(
            today.toordinal() - 1
        )

    else:

        return 0

    streak = 0

    for study_date in completed_dates:

        if study_date == current_date:

            streak += 1

            current_date = current_date.fromordinal(
                current_date.toordinal() - 1
            )

        else:

            break

    return streak

def get_subject_progress(
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

    result = []

    for subject in subjects:

        required_hours = float(
            subject.total_hours or 0
        )

        completed_hours = (
            db.query(
                func.coalesce(
                    func.sum(StudyPlan.study_hours),
                    0
                )
            )
            .filter(
                StudyPlan.user_id == current_user.id,
                StudyPlan.subject_id == subject.id,
                StudyPlan.completed == True
            )
            .scalar()
        )

        completed_hours = float(
            completed_hours or 0
        )

        if required_hours > 0:

            progress = (
                completed_hours /
                required_hours
            ) * 100

        else:

            progress = 0

        remaining_hours = max(
            required_hours - completed_hours,
            0
        )

        result.append({

            "subject_id":
                subject.id,

            "subject_name":
                subject.subject_name,

            "required_hours":
                round(required_hours, 2),

            "completed_hours":
                round(completed_hours, 2),

            "remaining_hours":
                round(remaining_hours, 2),

            "progress_percentage":
                round(progress, 2)

        })

    return result