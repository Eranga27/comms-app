import os
import sys
import unittest

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
from core.security import get_jwt_secret, create_access_token, DEFAULT_DEV_SECRET

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


class TestJwtSecretManagement(unittest.TestCase):
    def setUp(self):
        # Backup original env vars
        self.orig_jwt_secret = os.environ.get("JWT_SECRET_KEY")
        self.orig_env = os.environ.get("ENVIRONMENT")
        self.orig_app_env = os.environ.get("APP_ENV")

    def tearDown(self):
        # Restore original env vars
        if self.orig_jwt_secret is not None:
            os.environ["JWT_SECRET_KEY"] = self.orig_jwt_secret
        else:
            os.environ.pop("JWT_SECRET_KEY", None)

        if self.orig_env is not None:
            os.environ["ENVIRONMENT"] = self.orig_env
        else:
            os.environ.pop("ENVIRONMENT", None)

        if self.orig_app_env is not None:
            os.environ["APP_ENV"] = self.orig_app_env
        else:
            os.environ.pop("APP_ENV", None)

    def test_01_jwt_creation_works_with_valid_configured_secret(self):
        """Requirement 1: JWT creation works when a valid secret is configured."""
        custom_secret = "test_custom_super_secure_secret_key_987654321"
        os.environ["JWT_SECRET_KEY"] = custom_secret
        os.environ["ENVIRONMENT"] = "production"

        secret = get_jwt_secret()
        self.assertEqual(secret, custom_secret)

        token = create_access_token(data={"sub": "42"})
        payload = jwt.decode(token, custom_secret, algorithms=["HS256"])
        self.assertEqual(payload["sub"], "42")

    def test_02_production_does_not_silently_fallback_to_hardcoded_secret(self):
        """Requirement 2: The application does not silently fall back to a hardcoded production secret."""
        os.environ["ENVIRONMENT"] = "production"
        os.environ["JWT_SECRET_KEY"] = "eloquent_one_super_secret_key_change_me_in_prod"

        with self.assertRaises(RuntimeError) as cm:
            get_jwt_secret()

        self.assertIn("CRITICAL CONFIGURATION ERROR", str(cm.exception))
        self.assertIn("production", str(cm.exception).lower())

    def test_03_missing_production_secret_produces_clear_configuration_failure(self):
        """Requirement 3: Missing required production configuration produces a clear configuration failure."""
        os.environ["ENVIRONMENT"] = "production"
        os.environ.pop("JWT_SECRET_KEY", None)

        with self.assertRaises(RuntimeError) as cm:
            get_jwt_secret()

        self.assertIn("CRITICAL CONFIGURATION ERROR", str(cm.exception))
        self.assertIn("JWT_SECRET_KEY", str(cm.exception))

    def test_04_development_mode_uses_dev_fallback_safely(self):
        """Verification: Development mode uses local dev secret if unconfigured."""
        os.environ["ENVIRONMENT"] = "development"
        os.environ.pop("JWT_SECRET_KEY", None)

        secret = get_jwt_secret()
        self.assertEqual(secret, DEFAULT_DEV_SECRET)

    def test_05_existing_authentication_continues_to_work(self):
        """Requirement 4: Existing authentication flow continues to work."""
        Base.metadata.create_all(bind=engine)
        app.dependency_overrides[get_db] = override_get_db
        client = TestClient(app)

        try:
            db = TestingSessionLocal()
            test_user = models.User(
                id=200,
                email="secret_test@example.com",
                username="secrettest",
                hashed_password="mock_hashed_password",
                auth_provider="local",
                is_verified=1,
            )
            db.add(test_user)
            db.commit()
            db.close()

            token = create_access_token(data={"sub": "200"})
            headers = {"Authorization": f"Bearer {token}"}

            response = client.get("/api/auth/me", headers=headers)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["email"], "secret_test@example.com")
        finally:
            Base.metadata.drop_all(bind=engine)
            app.dependency_overrides.clear()


if __name__ == "__main__":
    unittest.main()
