from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "SpeakIQ Communication Coach"
    VERSION: str = "0.1.0"
    # Defaulting to SQLite for zero-config MVP local testing.
    # To use PostgreSQL, set DATABASE_URL=postgresql://user:password@localhost:5432/dbname in .env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    # OpenAI API has been fully replaced with local Faster-Whisper.

settings = Settings()
