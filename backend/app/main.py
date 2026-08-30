from fastapi import FastAPI

from app.database.database import engine
from app.database.base import Base

from app.models.user import User
from app.models.pending_user import PendingUser

from app.routers.user_router import router as user_router
from app.routers.auth_router import router as auth_router

from app.models.study_plan import StudyPlan
from app.routers.study_plan_router import router as study_plan_router

from app.models.exam import Exam
from app.routers.exam_router import router as exam_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers.subject_router import router as subject_router

from app.routers.dashboard_router import router as dashboard_router
# Create all database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Smart Study Scheduler API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register routers
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(subject_router)
app.include_router(study_plan_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "API Running Successfully"}