from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from core.database import engine, Base
import core.models  # Ensures models are registered before create_all

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SpeakIQ Communication Coach API",
    description="Backend for the SpeakIQ Communication Intelligence Platform",
    version="0.1.0",
)

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP. In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "SpeakIQ Communication Coach API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
