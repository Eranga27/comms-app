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
                
    except WebSocketDisconnect:
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
                
                # 1. CAF Technical Assessment (70 Points)
                caf_report = generate_caf_assessment(
                    transcript=full_transcript,
                    duration_seconds=duration,
                    filler_words=state["filler_words_count"],
                    timeline_events=state.get("timeline_events", [])
                )
                
                # 2. Automated Content Assessment (30 Points) & Feedback
                report = await generate_coaching_report(
                    transcript=full_transcript,
                    duration=duration,
                    caf_report=caf_report,
                    timeline_events=state.get("timeline_events", []),
                    practice_context=state.get("practice_context", "Custom Practice")
                )
                
                # 3. Final Calculations
                content_score = report.get("content_score", 15) # Default 15/30 if error
                total_score = caf_report["technical_score"] + content_score
                grade = get_communication_grade(total_score)
                
                report["overall_score"] = total_score
                report["grade"] = grade
                report["caf_breakdown"] = caf_report["categories"]
                
                # 4. Save to Database using a dedicated, standalone session lifecycle
                from core.database import SessionLocal
                save_db = SessionLocal()
                try:
                    db_session = models.Session(
                        id=session_id,
                        user_id=state.get("user_id"),
                        session_label=state.get("session_label", "Practice Session"),
                        practice_context=state.get("practice_context", "Custom Practice"),
                        duration_seconds=duration,
                        overall_score=total_score,
                        speech_score=caf_report["categories"]["speech_delivery"]["total"],
                        facial_score=caf_report["categories"]["facial_communication"]["total"],
                        gesture_score=caf_report["categories"]["gesture_communication"]["total"],
                        posture_score=caf_report["categories"]["posture_presence"]["total"],
                        content_score=content_score,
                        communication_grade=grade,
                        eye_contact_score=avg_eye_contact,
                        filler_words_count=state["filler_words_count"],
                        transcript=full_transcript,
                        timeline_events=state.get("timeline_events", []),
                        behavioral_flags=list(state.get("behavioral_flags", [])),
                        feedback_summary=json.dumps(report)
                    )
                    save_db.add(db_session)
                    save_db.commit()
                    print(f"Session {session_id} saved successfully.")
                except Exception as e:
                    save_db.rollback()
                    print(f"Error saving session: {e}")
                finally:
                    save_db.close()
                    
            asyncio.create_task(save_session())

@router.post("/session/{session_id}/audio")
async def process_session_audio(session_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Save the canvas-recorded webm to disk so the Results page can play it back.
    The session report was already generated asynchronously via WebSocket on disconnect.
    """
    try:
        contents = await file.read()
        if contents:
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

            save_path = os.path.join(media_dir, f"{session_id}.webm")
            with open(save_path, "wb") as f:
                f.write(contents)
            print(f"Session video saved: {save_path} ({len(contents)} bytes)")
        else:
            print(f"Empty video upload for session {session_id}, skipping save.")
        return {"status": "success"}
    except Exception as e:
        print(f"Audio endpoint error: {e}")
        return {"status": "error", "detail": str(e)}

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
