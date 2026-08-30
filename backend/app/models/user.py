from sqlalchemy import Column, Integer, String, DateTime
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    otp = Column(String(255), nullable=True)
    otp_expiry = Column(DateTime, nullable=True)