import os
import sys
import unittest

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from core.database import Base, get_db
import core.models as models
from core.security import create_access_token

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestSessionEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

        db = TestingSessionLocal()
        cls.user = models.User(
            id=500,
            email="session_endpoint@example.com",
            username="sessionendpoint",
            hashed_password="mock_hashed_password",
            auth_provider="local",
            is_verified=1,
        )
        db.add(cls.user)
        db.commit()

        cls.session_1 = models.Session(
            id="endpoint-sess-001",
            user_id=500,
            session_label="Sales Pitch Practice",
            practice_context="Sales Pitch",
            duration_seconds=120,
            overall_score=85,
            speech_score=20,
            facial_score=18,
            gesture_score=12,
            posture_score=8,
            content_score=27,
            communication_grade="Advanced Communicator",
            eye_contact_score=0.9,
            filler_words_count=2,
            transcript="Our value proposition delivers immediate ROI.",
            timeline_events=[],
            behavioral_flags=[],
            feedback_summary="{}"
        )
        db.add(cls.session_1)
        db.commit()
        db.close()

        cls.token = create_access_token(data={"sub": "500"})
        cls.headers = {"Authorization": f"Bearer {cls.token}"}

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        app.dependency_overrides.clear()

    def test_01_get_sessions_list(self):
        """Verifies GET /api/sessions returns authenticated user's sessions."""
        response = self.client.get("/api/sessions", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        sessions = response.json()
        self.assertEqual(len(sessions), 1)
        self.assertEqual(sessions[0]["id"], "endpoint-sess-001")
        self.assertEqual(sessions[0]["session_label"], "Sales Pitch Practice")

    def test_02_get_session_by_id(self):
        """Verifies GET /api/session/{id} returns detailed session data."""
        response = self.client.get("/api/session/endpoint-sess-001", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], "endpoint-sess-001")
        self.assertEqual(data["practice_context"], "Sales Pitch")
        self.assertEqual(data["overall_score"], 85)

    def test_03_audio_upload_and_deletion(self):
        """Verifies POST and DELETE /api/session/{id}/audio endpoints."""
        session_id = "endpoint-sess-001"
        fake_audio = b"RIFF....WEBM...MOCK_AUDIO_DATA"

        # Upload audio file
        upload_resp = self.client.post(
            f"/api/session/{session_id}/audio",
            files={"file": ("test.webm", fake_audio, "video/webm")}
        )
        self.assertEqual(upload_resp.status_code, 200)
        self.assertEqual(upload_resp.json()["status"], "success")

        # Delete audio file
        del_resp = self.client.delete(f"/api/session/{session_id}/audio")
        self.assertEqual(del_resp.status_code, 200)
        self.assertEqual(del_resp.json()["status"], "success")

    def test_04_delete_session(self):
        """Verifies DELETE /api/session/{id} removes session from DB."""
        response = self.client.delete("/api/session/endpoint-sess-001", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")

        # Verify session is deleted
        get_resp = self.client.get("/api/session/endpoint-sess-001", headers=self.headers)
        self.assertEqual(get_resp.status_code, 404)


if __name__ == "__main__":
    unittest.main()
