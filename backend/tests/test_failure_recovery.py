import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from core.database import Base, get_db, SessionLocal
import core.models as models
from core.assessment import generate_caf_assessment, get_communication_grade
from core.coach import generate_coaching_report

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestFailureRecovery(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def setUp(self):
        self.db = TestingSessionLocal()
        self.db.query(models.Session).delete()
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_01_empty_transcript_handling(self):
        """Verifies session report generation works safely even if transcript is empty/failed."""
        caf = generate_caf_assessment(
            transcript="",
            duration_seconds=30,
            filler_words=0,
            timeline_events=[]
        )
        self.assertIn("technical_score", caf)
        self.assertGreater(caf["technical_score"], 0)

    def test_02_coach_report_resilience_on_exception(self):
        """Verifies coach report returns fallback dictionary if local interpretation fails."""
        with patch("core.coach.len", side_effect=Exception("Corrupted input")):
            import asyncio
            report = asyncio.run(generate_coaching_report(
                transcript="Test transcript",
                duration=30,
                caf_report={"technical_score": 50, "categories": {}},
                timeline_events=[]
            ))
            self.assertEqual(report["content_score"], 15)
            self.assertIn("strengths", report)
            self.assertTrue(len(report["strengths"]) > 0)

    def test_03_websocket_disconnect_report_fallback(self):
        """Verifies session record is saved even when WebSocket disconnects with missing transcripts."""
        import uuid
        session_id = f"fail-recovery-{uuid.uuid4().hex[:8]}"
        with self.client.websocket_connect(f"/api/ws/session/{session_id}") as ws:
            ws.send_json({
                "type": "init",
                "data": {"label": "Failure Recovery Test", "practice_context": "Job Interview"}
            })
            # Send client metrics with no transcript
            ws.send_json({
                "type": "client_metrics",
                "data": {
                    "timestamp": 1,
                    "face_detected": True,
                    "eye_contact_score": 0.95,
                    "hands_detected": True,
                    "posture_score": 0.90
                }
            })

        # DB persistence runs asynchronously on disconnect, poll briefly for completion
        import time
        saved = None
        for _ in range(20):
            time.sleep(0.1)
            query_db = SessionLocal()
            saved = query_db.query(models.Session).filter(models.Session.id == session_id).first()
            query_db.close()
            if saved:
                break

        self.assertIsNotNone(saved, "Session should be saved to database even with missing transcript")
        self.assertEqual(saved.session_label, "Failure Recovery Test")
        self.assertGreater(saved.overall_score, 0)

if __name__ == '__main__':
    unittest.main()
