from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# We will use the DATABASE_URL from settings.
# For rapid MVP testing if Postgres isn't running via Docker yet, 
# we can seamlessly fallback to SQLite by changing the URL in .env,
# but the architecture remains entirely relational as per your recommendation.

if settings.DATABASE_URL.startswith("postgresql"):
    engine = create_engine(settings.DATABASE_URL)
else:
    # Fallback to SQLite if DATABASE_URL is changed to sqlite for local dev
    engine = create_engine(
        settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
