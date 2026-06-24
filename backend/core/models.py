from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True) # The WebSocket session ID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for MVP anonymous testing
    session_label = Column(String, nullable=True) # E.g., "Sales Pitch", "Interview"
    
    # --- CAF V1.0 CORE CATEGORY SCORES ---
    duration_seconds = Column(Integer, default=0)
    overall_score = Column(Float, default=0.0)
    speech_score = Column(Float, default=0.0)
    facial_score = Column(Float, default=0.0)
    gesture_score = Column(Float, default=0.0)
    posture_score = Column(Float, default=0.0)
    content_score = Column(Float, default=0.0)
    communication_grade = Column(String, nullable=True) # E.g., "Elite", "Advanced"

    # --- RAW TELEMETRY (Used for assessment calculation) ---
    eye_contact_score = Column(Float, default=0.0)
    filler_words_count = Column(Integer, default=0)
    
    # --- TEXT SUMMARIES & ARTIFACTS ---
    transcript = Column(Text, nullable=True)
    feedback_summary = Column(Text, nullable=True)

    # --- TIME-SERIES & BEHAVIORAL DATA ---
    from sqlalchemy import JSON
    timeline_events = Column(JSON, nullable=True)
    behavioral_flags = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
