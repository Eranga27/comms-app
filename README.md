# AI Communication Intelligence Platform 🎙️

Welcome to the MVP for the AI-powered Communication Coach.

This platform helps users improve their interview performance, public speaking, and presentation skills through real-time video/audio analysis using MediaPipe, OpenAI Whisper, and GPT-4o-mini.

## 🚀 Features
- **Real-Time AI Feedback:** Get live coaching while you speak (e.g., eye contact alerts, filler word warnings).
- **Video & Audio Analysis:** Streams data chunks over WebSockets asynchronously.
- **Comprehensive Results:** A post-session dashboard generating scores, strengths, and actionable tips via GPT.
- **Structured Intelligence Database:** Utilizes PostgreSQL (via SQLAlchemy) to store structured analytics and telemetry.

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, React WebRTC.
- **Backend:** Python FastAPI, Uvicorn, WebSockets.
- **AI Core:** Google MediaPipe (FaceMesh), OpenAI API (Whisper & GPT-4o-mini).
- **Database:** PostgreSQL (MVP utilizes SQLite fallback natively without Docker setup if `DATABASE_URL` is omitted).

## 💻 Running Locally

### 1. Start the Backend (FastAPI)
Open a terminal and run:
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # (Windows) or `source venv/bin/activate` (Mac/Linux)
pip install -r requirements.txt
```
Make sure you set your API key in a `.env` file inside the `backend` directory (optional for mock testing):
```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./sql_app.db # Or your PostgreSQL string
```
Run the server:
```bash
python main.py
```
*(Runs on `http://localhost:8000`)*

### 2. Start the Frontend (Next.js)
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

### 3. Test the Platform
Navigate to `http://localhost:3000` and click **"Start Practice"** to begin your session!

## 📌 Architecture Note
Following architectural best practices, this MVP currently relies purely on **PostgreSQL** for all structured intelligence metrics, scoring, and analytics (Final Report System). In future scaling phases, raw high-frequency telemetry (frame-by-frame analysis) will be offloaded to **MongoDB**.
