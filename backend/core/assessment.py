import json

def calculate_speech_delivery(duration_seconds: int, total_words: int, filler_words: int) -> dict:
    """Calculates Speech Delivery Score (Max 25 Points)"""
    duration_minutes = max(duration_seconds / 60.0, 0.1)
    
    # 1. Speech Pace (5 Points)
    wpm = total_words / duration_minutes
    if 120 <= wpm <= 160: pace_score = 5
    elif 100 <= wpm < 120 or 160 < wpm <= 180: pace_score = 4
    elif 80 <= wpm < 100 or 180 < wpm <= 200: pace_score = 3
    else: pace_score = 1
    
    # 2. Filler Word Control (5 Points)
    fillers_per_min = filler_words / duration_minutes
    if fillers_per_min <= 1: filler_score = 5
    elif fillers_per_min <= 3: filler_score = 4
    elif fillers_per_min <= 5: filler_score = 3
    elif fillers_per_min <= 8: filler_score = 2
    else: filler_score = 1
    
    # Defaults for metrics needing advanced audio waveform analysis in future phases
    vocal_variety = 3
    strategic_pauses = 3
    speech_clarity = 4
    
    total = pace_score + filler_score + vocal_variety + strategic_pauses + speech_clarity
    
    return {
        "total": total,
        "metrics": {
            "wpm": round(wpm, 1),
            "fillers_per_min": round(fillers_per_min, 1)
        },
        "breakdown": {
            "pace": pace_score,
            "fillers": filler_score,
            "vocal_variety": vocal_variety,
            "pauses": strategic_pauses,
            "clarity": speech_clarity
        }
    }

def calculate_facial_communication(timeline_events: list) -> dict:
    """Calculates Facial Communication Score (Max 20 Points)"""
    total_frames = len([e for e in timeline_events if e.get('event') == 'frame_tick'])
    if total_frames == 0: total_frames = 1
    
    eye_contact_frames = len([e for e in timeline_events if e.get('event') == 'eye_contact' and e.get('value', 0) > 0.5])
    eye_contact_percentage = (eye_contact_frames / total_frames) * 100
    
    # 1. Eye Contact (10 Points)
    if eye_contact_percentage >= 70: eye_score = 10
    elif eye_contact_percentage >= 60: eye_score = 8
    elif eye_contact_percentage >= 50: eye_score = 6
    elif eye_contact_percentage >= 40: eye_score = 4
    else: eye_score = 2
    
    # 2. Expression Variety / Smile Action Unit (5 Points)
    smile_frames = len([e for e in timeline_events if e.get('event') == 'smile' and e.get('value', 0.0) > 0.5])
    smile_percentage = (smile_frames / total_frames) * 100
    if smile_percentage >= 15: expression_variety = 5
    elif smile_percentage >= 5: expression_variety = 4
    elif smile_percentage >= 2: expression_variety = 3
    else: expression_variety = 1
    
    # 3. Engagement (5 Points)
    engagement = 5 if eye_score >= 8 else 3
    
    total = eye_score + engagement + expression_variety
    
    return {
        "total": total,
        "metrics": {"eye_contact_percentage": round(eye_contact_percentage, 1), "smile_percentage": round(smile_percentage, 1)},
        "breakdown": {
            "eye_contact": eye_score,
            "engagement": engagement,
            "expression_variety": expression_variety
        }
    }

def calculate_gesture_communication(timeline_events: list) -> dict:
    """Calculates Gesture Communication Score (Max 15 Points)"""
    total_frames = len([e for e in timeline_events if e.get('event') == 'frame_tick'])
    if total_frames == 0: total_frames = 1
    
    hands_visible_frames = len([e for e in timeline_events if e.get('event') == 'hands_detected' and e.get('value') is True])
    hands_percentage = (hands_visible_frames / total_frames) * 100
    
    # 1. Open Gesture Ratio / Hands Visibility (5 Points)
    if hands_percentage >= 70: gesture_score = 5
    elif hands_percentage >= 60: gesture_score = 4
    elif hands_percentage >= 40: gesture_score = 3
    elif hands_percentage >= 20: gesture_score = 2
    else: gesture_score = 1
    
    gesture_effectiveness = 3
    fidgeting_score = 5 # Default to minimal fidgeting
    
    total = gesture_score + gesture_effectiveness + fidgeting_score
    
    return {
        "total": total,
        "metrics": {"hands_visibility_percentage": round(hands_percentage, 1)},
        "breakdown": {
            "open_gestures": gesture_score,
            "effectiveness": gesture_effectiveness,
            "fidgeting": fidgeting_score
        }
    }

def get_communication_grade(total_score: int) -> str:
    if total_score >= 90: return "Elite Communicator"
    if total_score >= 80: return "Advanced Communicator"
    if total_score >= 70: return "Effective Communicator"
    if total_score >= 60: return "Developing Communicator"
    return "Needs Significant Improvement"

def generate_caf_assessment(transcript: str, duration_seconds: int, filler_words: int, timeline_events: list) -> dict:
    """
    Executes the deterministic Communication Assessment Framework (CAF).
    Returns the strict technical scores (70 points max).
    Content Quality (30 points) must be evaluated separately.
    """
    total_words = len(transcript.split()) if transcript else 0
    
    speech = calculate_speech_delivery(duration_seconds, total_words, filler_words)
    facial = calculate_facial_communication(timeline_events)
    gesture = calculate_gesture_communication(timeline_events)
    
    # Posture (10 Points) - V2.0 Pose Detection
    total_frames = len([e for e in timeline_events if e.get('event') == 'frame_tick'])
    if total_frames == 0: total_frames = 1
    
    posture_frames = len([e for e in timeline_events if e.get('event') == 'posture' and e.get('value', 0.0) > 0.5])
    posture_percentage = (posture_frames / total_frames) * 100
    
    if posture_percentage >= 80: posture_total = 10
    elif posture_percentage >= 50: posture_total = 8
    elif posture_percentage >= 30: posture_total = 5
    else: posture_total = 3
    
    technical_total = speech["total"] + facial["total"] + gesture["total"] + posture_total
    
    return {
        "technical_score": technical_total,
        "max_technical": 70,
        "categories": {
            "speech_delivery": speech,
            "facial_communication": facial,
            "gesture_communication": gesture,
            "posture_presence": {
                "total": posture_total,
                "breakdown": {"posture_quality": int(posture_total/2), "stability": int(posture_total/2)}
            }
        }
    }
