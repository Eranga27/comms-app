import os
import json

async def generate_coaching_report(transcript: str, duration: int, caf_report: dict, timeline_events: list):
    """
    CAF Phase 3: Local Offline Intelligence Layer
    Reads the strict mathematical CAF scores and timeline events to generate Evidence-Based Coaching dynamically.
    """
    try:
        strengths = []
        weaknesses = []
        tips = []
        
        # 1. Content Score Calculation (Max 30) - Advanced Local Heuristics
        word_count = len(transcript.split()) if transcript else 0
        content_score = 5 # Base
        
        # Structure and length
        if word_count > 40: content_score += 10
        elif word_count > 20: content_score += 5
        
        transcript_lower = transcript.lower()
        
        # Persuasion markers
        persuasive_words = ["because", "example", "reason", "therefore", "significant", "impact", "result"]
        found_persuasive = sum(1 for w in persuasive_words if w in transcript_lower)
        content_score += min(8, found_persuasive * 2)
        
        # Storytelling / Sequencing markers
        sequence_words = ["first", "second", "then", "finally", "next", "in conclusion", "start by"]
        found_seq = sum(1 for w in sequence_words if w in transcript_lower)
        content_score += min(7, found_seq * 2)
        
        content_score = min(30, max(0, content_score))
        
        # 2. Evidence-Based Interpretation
        # Eye Contact Context
        eye_losses = [e for e in timeline_events if e.get("event") == "eye_contact" and e.get("value", 0) < 0.5]
        if len(eye_losses) > 3:
            first_loss_time = f"{int(eye_losses[0]['time'] // 60):02}:{int(eye_losses[0]['time'] % 60):02}"
            weaknesses.append(f"Major: We noticed your eye contact drifted off-camera, especially starting around {first_loss_time}.")
            tips.append("Try to imagine the camera lens as a person's eyes. Holding your gaze there projects immense confidence.")
        elif len(eye_losses) > 0:
            weaknesses.append(f"Minor: Your focus occasionally shifted away from the camera ({len(eye_losses)} times).")
            tips.append("A little more sustained eye contact during key points will make your message hit harder.")
        elif duration > 5:
            strengths.append("Exceptional camera presence! You maintained a strong, engaging gaze throughout.")
            
        # Pacing Context
        wpm = caf_report["categories"]["speech_delivery"]["metrics"]["wpm"]
        if wpm > 160:
            weaknesses.append(f"Major: You were speaking at {wpm} WPM—a touch rushed.")
            tips.append("Slowing to around 140–150 WPM will give your ideas more room to land and help your audience absorb the details.")
        elif wpm < 100 and word_count > 10:
            weaknesses.append(f"Major: Your pacing was a bit measured at {wpm} WPM.")
            tips.append("Injecting a bit more energy and speed can help maintain audience engagement.")
        else:
            strengths.append(f"You maintained a highly engaging, conversational pace ({wpm} WPM).")

        # Filler Context
        fillers = caf_report["categories"]["speech_delivery"]["breakdown"]["fillers"]
        fillers_count = int(caf_report['categories']['speech_delivery']['metrics']['fillers_per_min'] * (duration/60))
        if fillers < 3:
            weaknesses.append(f"Major: We noticed a few too many filler words ({fillers_count} total).")
            tips.append("Embrace silence instead—purposeful pauses build executive presence much better than filler sounds.")
        elif fillers_count > 0:
            weaknesses.append(f"Minor: You used a handful of filler words ({fillers_count}).")
            tips.append("It's a minor detail, but substituting 'um' and 'uh' with brief pauses can polish your delivery.")
        else:
            strengths.append(f"Outstanding verbal fluency! You spoke with clarity and almost zero hesitation.")
            
        # Gesture Context
        hands_visible = caf_report["categories"]["gesture_communication"]["breakdown"]["open_gestures"]
        if hands_visible < 3:
            weaknesses.append("Major: Your hands were largely out of frame.")
            tips.append("Bringing your hands into view and using open-palm gestures naturally builds trust with your audience.")
        elif hands_visible >= 4:
            strengths.append("Great body language! Your open hand gestures perfectly complemented your spoken message.")

        # Posture Context
        posture_total = caf_report["categories"]["posture_presence"]["total"]
        if posture_total < 5:
            weaknesses.append("Major: There were moments where your posture seemed a bit relaxed.")
            tips.append("Sitting upright and centering yourself in the frame helps project immediate authority.")
        elif posture_total >= 8:
            strengths.append("You commanded the frame with excellent, stable posture.")
            
        # Ensure at least a minor exists if no weaknesses were caught
        if len(weaknesses) == 0:
            weaknesses.append("Minor: Look for continuous refinement of your non-verbal cues.")

        summary = (
            f"Great effort today! Your overall communication score is {caf_report['technical_score'] + content_score}/100. "
            f"Your structural depth and vocabulary earned a solid {content_score}/30 in content. "
            "By fine-tuning a few non-verbal cues mentioned below, you'll elevate your executive presence even further."
        )

        return {
            "content_score": content_score,
            "feedback_summary": summary,
            "strengths": strengths[:3] if strengths else ["Completed the baseline assessment."],
            "weaknesses": weaknesses[:3] if weaknesses else ["No major behavioral flags detected."],
            "tips": tips[:3] if tips else ["Continue practicing to solidify these habits."]
        }
    except Exception as e:
        print(f"Error in interpretation engine: {e}")
        return {
            "content_score": 15,
            "feedback_summary": "Error interpreting assessment data locally.",
            "strengths": ["System recorded the session."], "weaknesses": ["Analysis engine encountered an error."], "tips": ["Please try again."]
        }
