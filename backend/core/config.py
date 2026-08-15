from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Eloquent One Communication Coach"
    VERSION: str = "0.1.0"
    # Defaulting to SQLite for zero-config MVP local testing.
    # To use PostgreSQL, set DATABASE_URL=postgresql://user:password@localhost:5432/dbname in .env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # Resource Protection & Free-Tier Safeguards
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    MAX_SESSION_DURATION_SECONDS: int = int(os.getenv("MAX_SESSION_DURATION_SECONDS", "300"))
    
    # Single-Instance Rate Limiting (requests / 60 seconds per IP)
    RATE_LIMIT_AUTH_PER_MIN: int = int(os.getenv("RATE_LIMIT_AUTH_PER_MIN", "15"))
    RATE_LIMIT_UPLOADS_PER_MIN: int = int(os.getenv("RATE_LIMIT_UPLOADS_PER_MIN", "10"))
    RATE_LIMIT_WS_PER_MIN: int = int(os.getenv("RATE_LIMIT_WS_PER_MIN", "10"))

settings = Settings()
