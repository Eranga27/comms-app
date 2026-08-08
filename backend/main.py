import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.auth import router as auth_router
from core.database import engine, Base
import core.models  # Ensures models are registered before create_all

# Create DB tables (wrapped so a connection hiccup doesn't crash startup)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully.")
except Exception as e:
    print(f"WARNING: Could not create DB tables on startup: {e}")

app = FastAPI(
    title="Eloquent One Communication Coach API",
    description="Backend for the Eloquent One Communication Intelligence Platform",
    version="2.0.0",
)

# CORS: allow both local dev and production frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
allowed_origins = [frontend_url, "http://localhost:3000", "http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Eloquent One Communication Coach API is running."}

if __name__ == "__main__":
    import uvicorn
    # reload=False in production to avoid spawning 2 processes (doubles RAM usage)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

