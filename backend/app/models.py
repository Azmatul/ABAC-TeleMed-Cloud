from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base

class Registration(Base):
    __tablename__ = "registrations"
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)  # "DOCTOR" or "PATIENT"
    note = Column(String, nullable=True)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
