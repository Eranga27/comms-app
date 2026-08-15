import os
import sys
import unittest

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from core.assessment import (
    calculate_speech_delivery,
    calculate_facial_communication,
    calculate_gesture_communication,
    generate_caf_assessment,
    get_communication_grade,
)
from core.coach import generate_coaching_report


class TestCafScoring(unittest.TestCase):
    def test_01_calculate_speech_delivery(self):
        """Verifies WPM pace and filler word penalty calculations."""
        # 140 WPM (ideal), 0 fillers -> Max speech delivery score
        result = calculate_speech_delivery(duration_seconds=60, total_words=140, filler_words=0)
        self.assertEqual(result["breakdown"]["pace"], 5)
        self.assertEqual(result["breakdown"]["fillers"], 5)
        self.assertEqual(result["total"], 20)  # 5 + 5 + 3 + 3 + 4 default metrics

        # Extremely fast speech (220 WPM), high fillers -> penalized
        fast_result = calculate_speech_delivery(duration_seconds=60, total_words=220, filler_words=10)
        self.assertEqual(fast_result["breakdown"]["pace"], 1)
        self.assertEqual(fast_result["breakdown"]["fillers"], 1)

    def test_02_calculate_facial_communication(self):
        """Verifies eye contact and smile percentage calculations."""
        timeline_events = [
            {"event": "frame_tick"},
            {"event": "eye_contact", "value": 0.9},
            {"event": "smile", "value": 0.8},
            {"event": "frame_tick"},
            {"event": "eye_contact", "value": 0.95},
            {"event": "smile", "value": 0.7},
        ]
        facial = calculate_facial_communication(timeline_events)
        self.assertEqual(facial["breakdown"]["eye_contact"], 10)
        self.assertEqual(facial["breakdown"]["expression_variety"], 5)
        self.assertEqual(facial["total"], 20)

    def test_03_calculate_gesture_communication(self):
        """Verifies gesture and hand visibility calculations."""
        timeline_events = [
            {"event": "frame_tick"},
            {"event": "hands_detected", "value": True},
            {"event": "frame_tick"},
            {"event": "hands_detected", "value": True},
        ]
        gesture = calculate_gesture_communication(timeline_events)
        self.assertEqual(gesture["breakdown"]["open_gestures"], 5)
        self.assertEqual(gesture["total"], 13)  # 5 + 3 + 5

    def test_04_get_communication_grade(self):
        """Verifies communication grade bracket assignments."""
        self.assertEqual(get_communication_grade(95), "Elite Communicator")
        self.assertEqual(get_communication_grade(85), "Advanced Communicator")
        self.assertEqual(get_communication_grade(75), "Effective Communicator")
        self.assertEqual(get_communication_grade(65), "Developing Communicator")
        self.assertEqual(get_communication_grade(50), "Needs Significant Improvement")

    def test_05_generate_caf_assessment_composite(self):
        """Verifies composite technical assessment generation out of 70 points."""
        transcript = "Good morning everyone. Today we present our quarterly results."
        timeline_events = [
            {"event": "frame_tick"},
            {"event": "eye_contact", "value": 0.9},
            {"event": "posture", "value": 0.9},
        ]
        assessment = generate_caf_assessment(
            transcript=transcript,
            duration_seconds=60,
            filler_words=0,
            timeline_events=timeline_events
        )
        self.assertEqual(assessment["max_technical"], 70)
        self.assertIn("speech_delivery", assessment["categories"])
        self.assertIn("facial_communication", assessment["categories"])
        self.assertIn("gesture_communication", assessment["categories"])
        self.assertIn("posture_presence", assessment["categories"])

    def test_06_generate_coaching_report_context_aware(self):
        """Verifies local offline coaching engine for context-aware feedback."""
        import asyncio
        caf_report = {
            "technical_score": 60,
            "categories": {
                "speech_delivery": {"total": 20, "metrics": {"wpm": 140, "fillers_per_min": 0}, "breakdown": {"fillers": 5}},
                "facial_communication": {"total": 18, "metrics": {"eye_contact_percentage": 90.0, "smile_percentage": 20.0}},
                "gesture_communication": {"total": 12, "breakdown": {"open_gestures": 4}},
                "posture_presence": {"total": 8}
            }
        }
        timeline_events = [{"event": "eye_contact", "value": 0.9}]
        transcript = "Our product delivers immense ROI and value to our enterprise partners."

        report = asyncio.run(generate_coaching_report(
            transcript=transcript,
            duration=60,
            caf_report=caf_report,
            timeline_events=timeline_events,
            practice_context="Sales Pitch"
        ))
        self.assertIn("content_score", report)
        self.assertGreater(report["content_score"], 0)
        self.assertIn("feedback_summary", report)
        self.assertTrue(len(report["strengths"]) > 0)


if __name__ == "__main__":
    unittest.main()
