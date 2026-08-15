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


class TestAuthFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)
        app.dependency_overrides.clear()

    def test_01_register_validation_errors(self):
        """Verifies schema validation on registration (invalid email, weak password)."""
        # Invalid email
        response = self.client.post("/api/auth/register", json={
            "email": "notanemail",
            "password": "ValidPassword1"
        })
        self.assertEqual(response.status_code, 422)

        # Weak password (no uppercase or digits)
        response = self.client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "weak"
        })
        self.assertEqual(response.status_code, 422)

    def test_02_successful_registration_and_otp_flow(self):
        """Verifies full registration, OTP verification, and login lifecycle."""
        email = "new_user@example.com"
        password = "SecurePassword123"

        # 1. Register
        reg_response = self.client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "first_name": "TestUser"
        })
        self.assertEqual(reg_response.status_code, 200)
        self.assertEqual(reg_response.json()["email"], email)

        # Retrieve OTP code from DB directly for verification test
        db = TestingSessionLocal()
        db_user = db.query(models.User).filter(models.User.email == email).first()
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user.is_verified, 0)
        otp_code = db_user.otp_code
        db.close()

        # 2. Verify OTP
        otp_response = self.client.post("/api/auth/verify-otp", json={
            "email": email,
            "otp_code": otp_code
        })
        self.assertEqual(otp_response.status_code, 200)
        self.assertIn("access_token", otp_response.json())
        token = otp_response.json()["access_token"]

        # 3. Fetch profile with token
        headers = {"Authorization": f"Bearer {token}"}
        me_response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["email"], email)
        self.assertEqual(me_response.json()["is_verified"], 1)

    def test_03_login_with_valid_and_invalid_credentials(self):
        """Verifies OAuth2 password form login endpoint."""
        email = "login_test@example.com"
        password = "ValidPassword123"

        # Register & verify user
        self.client.post("/api/auth/register", json={"email": email, "password": password})
        db = TestingSessionLocal()
        u = db.query(models.User).filter(models.User.email == email).first()
        u.is_verified = 1
        db.commit()
        db.close()

        # Invalid password login
        bad_login = self.client.post("/api/auth/login", data={"username": email, "password": "WrongPassword1"})
        self.assertEqual(bad_login.status_code, 401)

        # Successful login
        good_login = self.client.post("/api/auth/login", data={"username": email, "password": password})
        self.assertEqual(good_login.status_code, 200)
        self.assertIn("access_token", good_login.json())

    def test_04_auth_me_unauthorized_without_token(self):
        """Verifies GET /api/auth/me requires valid Bearer token."""
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, 401)

        invalid_response = self.client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        self.assertEqual(invalid_response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
