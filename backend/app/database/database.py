import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Smart fallback: if DATABASE_URL is not set or points to unreachable local MySQL, use SQLite
if not DATABASE_URL or "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL:
    try:
        # Check if local MySQL is accessible
        if DATABASE_URL:
            engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            with engine.connect() as conn:
                pass
        else:
            raise Exception("No DATABASE_URL provided")
    except Exception as e:
        print(f"[Database] MySQL not reachable ({e}). Falling back to SQLite database.")
        DATABASE_URL = "sqlite:///./smart_study.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
else:
    # Production Cloud Database (PostgreSQL or Cloud MySQL)
    # Fix postgres:// to postgresql:// for SQLAlchemy 2.0 if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    connect_args = {}
    if "sqlite" in DATABASE_URL:
        connect_args = {"check_same_thread": False}

    engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()