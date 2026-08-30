import os
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

def clean_database_url(url: str) -> str:
    """
    Clean the DATABASE_URL for SQLAlchemy compatibility:
    - Fix postgres:// -> postgresql://
    - Remove unsupported params like channel_binding
    """
    if not url:
        return url

    # Fix Heroku-style postgres:// -> postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Remove channel_binding=require (not supported by psycopg2)
    url = re.sub(r'[&?]channel_binding=[^&]*', '', url)
    # Clean up trailing ? or &
    url = re.sub(r'\?&', '?', url)
    url = re.sub(r'[?&]$', '', url)

    return url

DATABASE_URL = clean_database_url(DATABASE_URL)

is_local = (
    not DATABASE_URL or
    "localhost" in DATABASE_URL or
    "127.0.0.1" in DATABASE_URL
)

if is_local and ("mysql" in DATABASE_URL or not DATABASE_URL):
    # Try local MySQL first, fallback to SQLite
    try:
        if DATABASE_URL and "mysql" in DATABASE_URL:
            _test_engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            with _test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            engine = _test_engine
            print(f"[Database] ✅ Connected to local MySQL")
        else:
            raise Exception("No local database URL")
    except Exception as e:
        print(f"[Database] Local MySQL not reachable ({e}). Using SQLite fallback.")
        DATABASE_URL = "sqlite:///./smart_study.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
        print(f"[Database] ✅ Using SQLite: smart_study.db")

elif "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    print(f"[Database] ✅ Using SQLite")

else:
    # Cloud database: PostgreSQL (Neon, Supabase, etc.) or Cloud MySQL
    connect_args = {}
    if "neon.tech" in DATABASE_URL or "postgresql" in DATABASE_URL:
        # Neon requires SSL
        connect_args = {"sslmode": "require"} if "sslmode" not in DATABASE_URL else {}

    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
    )
    print(f"[Database] ✅ Connected to cloud database ({DATABASE_URL[:40]}...)")

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