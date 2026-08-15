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
from core.security import get_password_hash, create_access_token

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


    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

        db = TestingSessionLocal()

        # Create User 1
        cls.user1 = models.User(
            id=1,
            email="user1@example.com",
            username="user1",
            hashed_password="mock_hashed_password",
            auth_provider="local",
            is_verified=1,
        )
        db.add(cls.user1)

        # Create User 2
        cls.user2 = models.User(
            id=2,
            email="user2@example.com",
            username="user2",
            hashed_password="mock_hashed_password",
            auth_provider="local",
            is_verified=1,
        )
        db.add(cls.user2)

        # Create Session owned by User 1
        cls.session1 = models.Session(
            id="session-user-1",
            user_id=1,
            session_label="User 1 Practice Session",
            practice_context="Job Interview",
            duration_seconds=120,
            overall_score=85.0,
            speech_score=20.0,
            facial_score=18.0,
            gesture_score=15.0,
            posture_score=8.0,
            content_score=24.0,
            communication_grade="Advanced Communicator",
        )
        db.add(cls.session1)

        # Create Session owned by User 2
        cls.session2 = models.Session(
            id="session-user-2",
            user_id=2,
            session_label="User 2 Practice Session",
            practice_context="Sales Pitch",
            duration_seconds=90,
            overall_score=78.0,
            speech_score=18.0,
            facial_score=16.0,
            gesture_score=14.0,
            posture_score=7.0,
            content_score=23.0,
            communication_grade="Effective Communicator",
        )
        db.add(cls.session2)

        db.commit()
        db.close()

        cls.token1 = create_access_token(data={"sub": "1"})
        cls.token2 = create_access_token(data={"sub": "2"})
        cls.headers_user1 = {"Authorization": f"Bearer {cls.token1}"}
        cls.headers_user2 = {"Authorization": f"Bearer {cls.token2}"}

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        app.dependency_overrides.clear()

    def test_01_user_can_access_own_session(self):
        """Requirement 1: User can access their own session."""
        response = self.client.get("/api/session/session-user-1", headers=self.headers_user1)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], "session-user-1")
        self.assertEqual(data["session_label"], "User 1 Practice Session")

    def test_02_user_cannot_access_another_user_session(self):
        """Requirement 2: User cannot access another user's session."""
        # User 2 attempts to access User 1's session
        response = self.client.get("/api/session/session-user-1", headers=self.headers_user2)
        # Should return 404 Not Found without revealing existence
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Session not found")

    def test_03_unauthenticated_user_cannot_access_session(self):
        """Verification: Unauthenticated request receives 401 Unauthorized."""
        response = self.client.get("/api/session/session-user-1")
        self.assertEqual(response.status_code, 401)

    def test_04_non_existent_session_returns_404(self):
        """Verification: Non-existent session ID returns 404 identically."""
        response = self.client.get("/api/session/non-existent-session-id", headers=self.headers_user1)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Session not found")

    def test_05_user_cannot_delete_another_user_session(self):
        """Requirement 4: User cannot delete another user's session."""
        # User 2 attempts to delete User 1's session
        response = self.client.delete("/api/session/session-user-1", headers=self.headers_user2)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Session not found")

        # Verify session-user-1 still exists in DB
        db = TestingSessionLocal()
        session = db.query(models.Session).filter(models.Session.id == "session-user-1").first()
        db.close()
        self.assertIsNotNone(session)

    def test_06_user_can_delete_own_session(self):
        """Requirement 3: User can delete their own session."""
        response = self.client.delete("/api/session/session-user-2", headers=self.headers_user2)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "success"})

        # Verify session-user-2 was deleted from DB
        db = TestingSessionLocal()
        session = db.query(models.Session).filter(models.Session.id == "session-user-2").first()
        db.close()
        self.assertIsNone(session)


if __name__ == "__main__":
    unittest.main()
