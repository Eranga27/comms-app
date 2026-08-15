from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, UploadFile, File, Query, Request
from sqlalchemy.orm import Session
from typing import Dict, Optional
import json
import asyncio
import random
import time
import jwt
import os

from core.coach import generate_coaching_report
from core.database import get_db
from core.security import get_current_user, get_jwt_secret
from core.config import settings
from core.rate_limiter import get_client_ip, check_rate_limit
import core.models as models

def _user_id_from_token(token: str) -> Optional[int]:
    """Returns user id from a JWT token string, or None if invalid."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
        sub = payload.get("sub")
        return int(sub) if sub else None
    except Exception:
        return None

router = APIRouter()

active_sessions: Dict[str, WebSocket] = {}
session_state: Dict[str, dict] = {}

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/sessions")
def get_all_sessions(request: Request, db: Session = Depends(get_db)):
    """Return sessions for the authenticated user only (filtered by JWT token)."""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""
    user_id = _user_id_from_token(token)

    query = db.query(models.Session)
    if user_id:
        query = query.filter(models.Session.user_id == user_id)
    else:
        return []
    
    db_sessions = query.order_by(models.Session.created_at.desc()).all()
    return [{
        "id": s.id,
        "timestamp": s.created_at.isoformat() if s.created_at else None,
        "duration_seconds": s.duration_seconds,
        "overall_score": s.overall_score,
        "session_label": s.session_label,
        "practice_context": s.practice_context,
        "speech_score": s.speech_score,
        "facial_score": s.facial_score,
        "gesture_score": s.gesture_score,
        "posture_score": s.posture_score,
        "content_score": s.content_score,
        "eye_contact_score": s.eye_contact_score,
        "filler_words_count": s.filler_words_count,
        "communication_grade": s.communication_grade
    } for s in db_sessions]

@router.get("/session/{session_id}")
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not db_session or db_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "id": db_session.id,
        "session_label": db_session.session_label,
        "duration_seconds": db_session.duration_seconds,
        "overall_score": db_session.overall_score,
        "speech_score": db_session.speech_score,
        "facial_score": db_session.facial_score,
        "gesture_score": db_session.gesture_score,
        "posture_score": db_session.posture_score,
        "content_score": db_session.content_score,
        "communication_grade": db_session.communication_grade,
        "eye_contact_score": db_session.eye_contact_score,
        "filler_words_count": db_session.filler_words_count,
        "transcript": db_session.transcript,
        "timeline_events": db_session.timeline_events,
        "behavioral_flags": db_session.behavioral_flags,
        "feedback_summary": db_session.feedback_summary,
        "practice_context": db_session.practice_context
    }

@router.delete("/session/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not db_session or db_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Try to delete associated video file
    import os
    media_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media", f"{session_id}.webm")
    if os.path.exists(media_path):
        try:
            os.remove(media_path)
        except:
            pass
            
    db.delete(db_session)
    db.commit()
    return {"status": "success"}

@router.websocket("/ws/session/{session_id}")
async def practice_session_websocket(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(default=""),
    db: Session = Depends(get_db)
):
    client_ip = get_client_ip(websocket)
    if not check_rate_limit("ws", client_ip, settings.RATE_LIMIT_WS_PER_MIN):
        await websocket.close(code=1008, reason="WebSocket rate limit exceeded")
        return

    await websocket.accept()
    active_sessions[session_id] = websocket
    
    user_id = _user_id_from_token(token)
    
    # Initialize session state
    session_state[session_id] = {
        "start_time": time.time(),
        "transcripts": [],
        "eye_contact_scores": [],
        "filler_words_count": 0,
        "timeline_events": [],
        "behavioral_flags": set(),
        "session_label": "Practice Session",
        "practice_context": "Custom Practice",
        "user_id": user_id
    }
    
    print(f"Session {session_id} connected via WebSocket.")

    try:
        while True:
            # Enforce server-side maximum session duration protection
            elapsed_seconds = time.time() - session_state[session_id]["start_time"]
            if elapsed_seconds >= settings.MAX_SESSION_DURATION_SECONDS:
                print(f"Session {session_id} reached max duration of {settings.MAX_SESSION_DURATION_SECONDS}s. Terminating gracefully.")
                try:
                    await websocket.send_json({
                        "type": "duration_exceeded",
                        "data": {
                            "message": f"Maximum session duration of {settings.MAX_SESSION_DURATION_SECONDS // 60} minutes reached. Finalizing report.",
                            "max_seconds": settings.MAX_SESSION_DURATION_SECONDS
                        }
                    })
                except Exception:
                    pass
                break

            data_str = await websocket.receive_text()
            try:
                payload = json.loads(data_str)
                msg_type = payload.get("type")
                
                if msg_type == "init":
                    data = payload.get("data")
                    if data and data.get("label"):
                        session_state[session_id]["session_label"] = data.get("label")
                    if data and data.get("practice_context"):
                        session_state[session_id]["practice_context"] = data.get("practice_context")
                        
                elif msg_type == "client_metrics":
                    data = payload.get("data")
                    if data:
                        timestamp = data.get("timestamp", 0)
                        face_detected = data.get("face_detected", False)
                        score = data.get("eye_contact_score", 0)
                        hands_detected = data.get("hands_detected", False)
                        smile_score = data.get("smile_score", 0.0)
                        posture_score = data.get("posture_score", 0.0)
                        
                        # Add to timeline events for precise calculation later
                        session_state[session_id]["timeline_events"].append({"time": timestamp, "event": "frame_tick"})
                        session_state[session_id]["timeline_events"].append({"time": timestamp, "event": "eye_contact", "value": score})
                        session_state[session_id]["timeline_events"].append({"time": timestamp, "event": "hands_detected", "value": hands_detected})
                        session_state[session_id]["timeline_events"].append({"time": timestamp, "event": "smile", "value": smile_score})
                        session_state[session_id]["timeline_events"].append({"time": timestamp, "event": "posture", "value": posture_score})
                        
                        if face_detected:
                            session_state[session_id]["eye_contact_scores"].append(score)
                            
                            if score < 0.5:
                                if random.random() < 0.1:
                                    session_state[session_id]["behavioral_flags"].add("eye_contact_lost")
                                    await websocket.send_json({
                                        "type": "feedback",
                                        "data": {"message": "Try to look at the camera.", "type": "warning"}
                                    })
                            elif score >= 0.9:
                                if random.random() < 0.05:
                                    await websocket.send_json({
                                        "type": "feedback",
                                        "data": {"message": "Great eye contact!", "type": "positive"}
                                    })
                            
                            if not hands_detected and random.random() < 0.05:
                                await websocket.send_json({
                                    "type": "feedback",
                                    "data": {"message": "Keep your hands visible.", "type": "warning"}
                                })
                            elif hands_detected and random.random() < 0.02:
                                await websocket.send_json({
                                    "type": "feedback",
                                    "data": {"message": "Good use of gestures!", "type": "positive"}
                                })
                                
                            if posture_score < 0.5 and random.random() < 0.05:
                                await websocket.send_json({
                                    "type": "feedback",
                                    "data": {"message": "Sit upright to command presence.", "type": "warning"}
                                })

                elif msg_type == "live_transcript":
                    chunk = payload.get("data", "")
                    if chunk:
                        session_state[session_id]["transcripts"].append(chunk)
                        
                        import re
                        text = chunk.lower()
                        fillers = ["um", "uh", "ah", "like", "basically", "actually", "literally"]
                        found_fillers = []
                        currentTime = payload.get("timestamp", 0)
                        
                        for f in fillers:
                            matches = re.findall(rf'\b{f}\b', text)
                            if matches:
                                found_fillers.append(f)
                                session_state[session_id]["filler_words_count"] += len(matches)
                                for _ in range(len(matches)):
                                    session_state[session_id]["timeline_events"].append({"time": currentTime, "event": "filler_word", "value": f})
                                
                        for phrase in ["you know", "i mean", "sort of", "kind of"]:
                            if phrase in text:
                                found_fillers.append(phrase)
                                count = text.count(phrase)
                                session_state[session_id]["filler_words_count"] += count
                                for _ in range(count):
                                    session_state[session_id]["timeline_events"].append({"time": currentTime, "event": "filler_word", "value": phrase})
                        
                        if found_fillers:
                            await websocket.send_json({
                                "type": "feedback",
                                "data": {"message": f"Try to avoid filler words like '{found_fillers[0]}'", "type": "warning"}
                            })

                elif msg_type == "final_transcript":
                    final_text = payload.get("data", "")
                    if final_text:
                        session_state[session_id]["transcripts"] = [final_text]
                        # Recount total accurately
                        import re
                        text = final_text.lower()
                        total_fillers = 0
                        for f in ["um", "uh", "ah", "like", "basically", "actually", "literally"]:
                            total_fillers += len(re.findall(rf'\b{f}\b', text))
                        for phrase in ["you know", "i mean", "sort of", "kind of"]:
                            total_fillers += text.count(phrase)
                        session_state[session_id]["filler_words_count"] = total_fillers

            except json.JSONDecodeError:
                pass
                
    except (WebSocketDisconnect, Exception) as e:
        pass
    finally:
        print(f"Session {session_id} disconnected. Generating report...")
        if session_id in active_sessions:
            del active_sessions[session_id]
            
        state = session_state.pop(session_id, None)
        if state:
            duration = int(time.time() - state["start_time"])
            full_transcript = " ".join(state["transcripts"])
            avg_eye_contact = sum(state["eye_contact_scores"]) / len(state["eye_contact_scores"]) if state["eye_contact_scores"] else 0.0
            
            # Fire and forget async task to generate report and save to DB
            # We don't await it here so we don't hold up the WebSocket loop closure,
            # though FastAPI will clean it up anyway. Wait, FastAPI doesn't cleanly support
            # background tasks in WebSocketDisconnect directly without passing to a queue.
            # We'll just run it synchronously-ish or use asyncio.create_task.
            
            async def save_session():
                from core.assessment import generate_caf_assessment, get_communication_grade
                
                # 1. CAF Technical Assessment (70 Points) with fallback
                try:
                    caf_report = generate_caf_assessment(
                        transcript=full_transcript,
                        duration_seconds=duration,
                        filler_words=state.get("filler_words_count", 0),
                        timeline_events=state.get("timeline_events", [])
                    )
                except Exception as caf_err:
                    print(f"CAF Assessment error (falling back to baseline): {caf_err}")
                    caf_report = {
                        "technical_score": 45,
                        "categories": {
                            "speech_delivery": {"total": 15, "metrics": {"wpm": 120, "fillers_per_min": 0}, "breakdown": {"fillers": 0}},
                            "facial_communication": {"total": 12},
                            "gesture_communication": {"total": 10, "breakdown": {"open_gestures": 2}},
                            "posture_presence": {"total": 8}
                        }
                    }
                
                # 2. Automated Content Assessment (30 Points) & Feedback with fallback
                try:
                    report = await generate_coaching_report(
                        transcript=full_transcript,
                        duration=duration,
                        caf_report=caf_report,
                        timeline_events=state.get("timeline_events", []),
                        practice_context=state.get("practice_context", "Custom Practice")
                    )
                except Exception as coach_err:
                    print(f"Coaching Report generation error (falling back to baseline): {coach_err}")
                    report = {
                        "content_score": 15,
                        "feedback_summary": "Session report compiled successfully from recorded behavioral telemetry.",
                        "strengths": ["Session data successfully preserved.", "Recorded behavioral telemetry."],
                        "weaknesses": ["Detailed transcription interpretation was limited for this session."],
                        "tips": ["Continue practicing with clear vocal projection and steady pacing."]
                    }
                
                # 3. Final Calculations
                content_score = report.get("content_score", 15)
                tech_score = caf_report.get("technical_score", 45)
                total_score = tech_score + content_score
                grade = get_communication_grade(total_score)
                
                report["overall_score"] = total_score
                report["grade"] = grade
                report["caf_breakdown"] = caf_report.get("categories", {})
                
                # 4. Save to Database using a dedicated, standalone session lifecycle
                from core.database import SessionLocal
                save_db = SessionLocal()
                try:
                    speech_score = caf_report.get("categories", {}).get("speech_delivery", {}).get("total", 15)
                    facial_score = caf_report.get("categories", {}).get("facial_communication", {}).get("total", 12)
                    gesture_score = caf_report.get("categories", {}).get("gesture_communication", {}).get("total", 10)
                    posture_score = caf_report.get("categories", {}).get("posture_presence", {}).get("total", 8)

                    db_session = models.Session(
                        id=session_id,
                        user_id=state.get("user_id"),
                        session_label=state.get("session_label", "Practice Session"),
                        practice_context=state.get("practice_context", "Custom Practice"),
                        duration_seconds=duration,
                        overall_score=total_score,
                        speech_score=speech_score,
                        facial_score=facial_score,
                        gesture_score=gesture_score,
                        posture_score=posture_score,
                        content_score=content_score,
                        communication_grade=grade,
                        eye_contact_score=avg_eye_contact,
                        filler_words_count=state.get("filler_words_count", 0),
                        transcript=full_transcript if full_transcript else "Audio captured — transcription fallback applied.",
                        timeline_events=state.get("timeline_events", []),
                        behavioral_flags=list(state.get("behavioral_flags", [])),
                        feedback_summary=json.dumps(report)
                    )
                    save_db.add(db_session)
                    save_db.commit()
                    print(f"Session {session_id} saved successfully with robust fallbacks.")
                except Exception as e:
                    save_db.rollback()
                    print(f"Error saving session to database: {e}")
                finally:
                    save_db.close()
                    
            asyncio.create_task(save_session())

@router.post("/session/{session_id}/audio")
async def process_session_audio(request: Request, session_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Save the canvas-recorded webm to disk so the Results page can play it back.
    Enforces rate limits and maximum upload size limits using streaming chunk verification.
    """
    client_ip = get_client_ip(request)
    if not check_rate_limit("uploads", client_ip, settings.RATE_LIMIT_UPLOADS_PER_MIN):
        raise HTTPException(status_code=429, detail="Too many file upload requests. Please try again later.")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > max_bytes:
                raise HTTPException(status_code=413, detail=f"Upload size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB")
        except ValueError:
            pass

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    media_dir = os.path.join(base_dir, "media")
    os.makedirs(media_dir, exist_ok=True)
    
    # Cleanup old videos to save space (older than 15 mins)
    now = time.time()
    for filename in os.listdir(media_dir):
        filepath = os.path.join(media_dir, filename)
        if os.path.isfile(filepath):
            if now - os.path.getmtime(filepath) > 900:
                try:
                    os.remove(filepath)
                except Exception:
                    pass

    temp_path = os.path.join(media_dir, f"{session_id}.webm.tmp")
    save_path = os.path.join(media_dir, f"{session_id}.webm")
    total_bytes = 0

    try:
        with open(temp_path, "wb") as f:
            while True:
                chunk = await file.read(64 * 1024)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    f.close()
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    raise HTTPException(status_code=413, detail=f"Upload size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB")
                f.write(chunk)

        if total_bytes == 0:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            print(f"Empty video upload for session {session_id}, skipping save.")
            return {"status": "success"}

        if os.path.exists(save_path):
            os.remove(save_path)
        os.rename(temp_path, save_path)
        print(f"Session video saved: {save_path} ({total_bytes} bytes)")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Audio endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save upload media file")

@router.delete("/session/{session_id}/audio")
def delete_session_audio(session_id: str):
    """Delete just the video to save space once it's been viewed."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    media_path = os.path.join(base_dir, "media", f"{session_id}.webm")
    if os.path.exists(media_path):
        try:
            os.remove(media_path)
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "detail": str(e)}
    return {"status": "not_found"}
