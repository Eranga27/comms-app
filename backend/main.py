import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.auth import router as auth_router
from core.database import engine, Base
import core.models  # Ensures models are registered before create_all

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Eloquent One Communication Coach API",
    description="Backend for the Eloquent One Communication Intelligence Platform",
    version="2.0.0",
)

# Hardened CORS policy for production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

