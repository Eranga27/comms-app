import os
import sys
import time
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
import core.database as db_module
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


class TestWebSocketSessionLifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        cls.orig_session_local = db_module.SessionLocal
        db_module.SessionLocal = TestingSessionLocal
        cls.client = TestClient(app)

        db = TestingSessionLocal()
        cls.test_user = models.User(
            id=300,
            email="ws_test@example.com",
            username="wstest",
            hashed_password="mock_hashed_password",
            auth_provider="local",
            is_verified=1,
        )
        db.add(cls.test_user)
        db.commit()
        db.close()

        cls.token = create_access_token(data={"sub": "300"})

    @classmethod
    def tearDownClass(cls):
        db_module.SessionLocal = cls.orig_session_local
        Base.metadata.drop_all(bind=engine)
        app.dependency_overrides.clear()

    def test_01_websocket_connect_telemetry_disconnect_and_background_persistence(self):
        """
        Tests WebSocket lifecycle:
        1. Normal WebSocket session persistence
        2. WebSocket disconnect persistence
        3. Background persistence using valid database session (SessionLocal)
        4. Database session cleanup
        5. Session data correctly saved
        """
        session_id = "ws-test-session-001"
        url = f"/api/ws/session/{session_id}?token={self.token}"

        # Connect WebSocket
        with self.client.websocket_connect(url) as ws:
            # Send init configuration
            ws.send_json({
                "type": "init",
                "data": {
                    "label": "Engineering Demo Presentation",
                    "practice_context": "Technical Pitch"
                }
            })

            # Send client telemetry frame metrics
            ws.send_json({
                "type": "client_metrics",
                "data": {
                    "timestamp": 1.0,
                    "face_detected": True,
                    "eye_contact_score": 0.95,
                    "hands_detected": True,
                    "smile_score": 0.8,
                    "posture_score": 0.9
                }
            })

            # Send live transcript chunks
            ws.send_json({
                "type": "live_transcript",
                "data": "Hello everyone, welcome to our technical presentation today.",
                "timestamp": 2.0
            })

            # Send final transcript chunk with filler words
            ws.send_json({
                "type": "live_transcript",
                "data": "Um basically, we are thrilled to announce our new system architecture, like, you know.",
                "timestamp": 5.0
            })

            # Disconnect WebSocket (triggers WebSocketDisconnect in backend handler)
            ws.close()

        # Small delay to ensure background task completes
        time.sleep(0.5)

        # Query database to verify session persistence
        db = TestingSessionLocal()
        try:
            saved_session = db.query(models.Session).filter(models.Session.id == session_id).first()
            self.assertIsNotNone(saved_session, "Session record was not saved to DB on disconnect!")

            # Verify saved session data integrity
            self.assertEqual(saved_session.id, session_id)
            self.assertEqual(saved_session.user_id, 300)
            self.assertEqual(saved_session.session_label, "Engineering Demo Presentation")
            self.assertEqual(saved_session.practice_context, "Technical Pitch")
            self.assertGreaterEqual(saved_session.overall_score, 0)
            self.assertIn("Hello everyone", saved_session.transcript)
            self.assertGreater(saved_session.filler_words_count, 0)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
