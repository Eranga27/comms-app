import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from core.database import engine, Base
import core.models  # Ensures models are registered before create_all

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Eloquent One Communication Coach API",
    description="Backend for the Eloquent One Communication Intelligence Platform",
    version="0.1.0",
)

# CORS — restrict to specific origins in production, allow all locally
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Eloquent One Communication Coach API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

