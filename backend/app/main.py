from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database.base import Base

from app.models.user import User
from app.models.pending_user import PendingUser
from app.models.study_plan import StudyPlan
from app.models.exam import Exam
from app.models.subject import Subject

from app.routers.user_router import router as user_router
from app.routers.auth_router import router as auth_router
from app.routers.exam_router import router as exam_router
from app.routers.subject_router import router as subject_router
from app.routers.study_plan_router import router as study_plan_router
from app.routers.dashboard_router import router as dashboard_router

# Create all database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Database Error] create_all warning: {e}")

# Create FastAPI app
app = FastAPI(
    title="Smart Study Scheduler API",
    version="1.0.0"
)

# CORS middleware configured for Vercel & Localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return {"message": "API Running Successfully", "status": "online"}