import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from core.database import Base, get_db
import core.models as models
from core.security import (
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

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


class TestJwtExpiration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

        db = TestingSessionLocal()
        cls.test_user = models.User(
            id=100,
            email="jwt_test@example.com",
            username="jwttest",
            hashed_password="mock_hashed_password",
            auth_provider="local",
            is_verified=1,
        )
        db.add(cls.test_user)
        db.commit()
        db.close()

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        app.dependency_overrides.clear()

    def test_01_token_uses_configured_expiration_period(self):
        """Requirement 1: A newly created access token uses the configured expiration period."""
        now = datetime.utcnow().replace(tzinfo=timezone.utc)
        token = create_access_token(data={"sub": "100"})

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        self.assertIsNotNone(exp)

        expected_exp = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expected_exp_timestamp = int(expected_exp.timestamp())

        # Allow 10-second tolerance for execution duration
        self.assertAlmostEqual(exp, expected_exp_timestamp, delta=10)

    def test_02_token_creation_path_does_not_default_to_15_minutes(self):
        """Requirement 2: The token creation path no longer unexpectedly defaults to 15 minutes."""
        now = datetime.utcnow().replace(tzinfo=timezone.utc)
        token = create_access_token(data={"sub": "100"})

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")

        fifteen_min_timestamp = int((now + timedelta(minutes=15)).timestamp())

        # Expiration must be significantly larger than 15 minutes (7 days = 10080 mins)
        time_difference = exp - fifteen_min_timestamp
        self.assertGreater(
            time_difference,
            (60 * 24 * 6) * 60,
            "Token exp is close to 15 minutes, which indicates fallback was used!",
        )

    def test_03_custom_expires_delta_still_respected(self):
        """Verification: Explicit expires_delta parameter is still honored if provided."""
        now = datetime.utcnow().replace(tzinfo=timezone.utc)
        custom_delta = timedelta(hours=2)
        token = create_access_token(data={"sub": "100"}, expires_delta=custom_delta)

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        expected_exp = int((now + custom_delta).timestamp())

        self.assertAlmostEqual(exp, expected_exp, delta=10)

    def test_04_existing_authentication_continues_to_work(self):
        """Requirement 3: Existing authentication continues to work with configured tokens."""
        token = create_access_token(data={"sub": "100"})
        headers = {"Authorization": f"Bearer {token}"}

        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], 100)
        self.assertEqual(data["email"], "jwt_test@example.com")


if __name__ == "__main__":
    unittest.main()
