import os
import time
import unittest
import io
from fastapi.testclient import TestClient
from main import app
from core.database import Base, engine, SessionLocal
from core import models
from core.config import settings
from core.rate_limiter import reset_rate_limiter

class TestResourceProtection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def setUp(self):
        reset_rate_limiter()
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()
        reset_rate_limiter()

    def test_01_valid_upload_succeeds(self):
        """Verifies valid audio/video file upload under size limit succeeds."""
        session_id = "test-valid-upload-001"
        file_content = b"fake webm binary video contents for testing"
        file_data = {"file": ("test.webm", io.BytesIO(file_content), "video/webm")}

        response = self.client.post(f"/api/session/{session_id}/audio", files=file_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("status"), "success")

        # Verify file exists on disk
        media_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media", f"{session_id}.webm")
        self.assertTrue(os.path.exists(media_path))

        # Cleanup
        if os.path.exists(media_path):
            os.remove(media_path)

    def test_02_oversized_upload_rejected(self):
        """Verifies oversized upload is rejected with HTTP 413 Payload Too Large."""
        session_id = "test-oversized-upload-001"
        # Temporarily set max upload size to 1MB for deterministic testing
        original_max = settings.MAX_UPLOAD_SIZE_MB
        settings.MAX_UPLOAD_SIZE_MB = 1  # 1 MB

        try:
            # Create a payload of 1.2 MB
            oversized_content = b"X" * (1024 * 1024 + 200 * 1024)
            file_data = {"file": ("big.webm", io.BytesIO(oversized_content), "video/webm")}

            response = self.client.post(f"/api/session/{session_id}/audio", files=file_data)
            self.assertEqual(response.status_code, 413)
            self.assertIn("Upload size exceeds maximum allowed limit", response.json().get("detail", ""))

            # Verify temp and final file do not exist on disk
            base_media = os.path.join(os.path.dirname(os.path.dirname(__file__)), "media")
            self.assertFalse(os.path.exists(os.path.join(base_media, f"{session_id}.webm")))
            self.assertFalse(os.path.exists(os.path.join(base_media, f"{session_id}.webm.tmp")))
        finally:
            settings.MAX_UPLOAD_SIZE_MB = original_max

    def test_03_max_session_duration_enforced_and_telemetry_saved(self):
        """Verifies server-side max session duration enforcement and telemetry preservation."""
        session_id = f"duration-test-{int(time.time())}"
        original_duration = settings.MAX_SESSION_DURATION_SECONDS
        settings.MAX_SESSION_DURATION_SECONDS = 1  # 1 second cap for fast testing

        try:
            with self.client.websocket_connect(f"/api/ws/session/{session_id}") as ws:
                ws.send_json({"type": "init", "data": {"label": "Duration Test Session"}})
                ws.send_json({
                    "type": "client_metrics",
                    "data": {
                        "timestamp": 100,
                        "face_detected": True,
                        "eye_contact_score": 0.95,
                        "hands_detected": True,
                        "smile_score": 0.8,
                        "posture_score": 0.9
                    }
                })

                # Wait for session duration cap to expire (1s)
                time.sleep(1.2)

                # Send another message tick to trigger server-side duration check
                ws.send_json({"type": "client_metrics", "data": {"timestamp": 200}})

                # Read queued WebSocket messages until duration_exceeded is received
                received_types = []
                for _ in range(10):
                    try:
                        m = ws.receive_json()
                        if m and isinstance(m, dict):
                            received_types.append(m.get("type"))
                            if m.get("type") == "duration_exceeded":
                                break
                    except Exception:
                        break

                self.assertIn("duration_exceeded", received_types)

            # DB persistence runs asynchronously on disconnect, poll briefly for completion
            saved = None
            for _ in range(20):
                time.sleep(0.1)
                query_db = SessionLocal()
                saved = query_db.query(models.Session).filter(models.Session.id == session_id).first()
                query_db.close()
                if saved:
                    break

            self.assertIsNotNone(saved, "Telemetry must be preserved when max session duration is reached")
            self.assertEqual(saved.session_label, "Duration Test Session")
            self.assertGreaterEqual(saved.eye_contact_score, 0.9)

        finally:
            settings.MAX_SESSION_DURATION_SECONDS = original_duration

    def test_04_request_throttling_rate_limiting(self):
        """Verifies rate limiting throttling triggers HTTP 429 when threshold exceeded."""
        original_limit = settings.RATE_LIMIT_AUTH_PER_MIN
        settings.RATE_LIMIT_AUTH_PER_MIN = 3  # Cap at 3 for testing

        try:
            # First 3 requests should proceed (or succeed/fail validation, but reach limit)
            for i in range(3):
                res = self.client.post("/api/auth/register", json={
                    "email": f"rate_{i}_{int(time.time())}@test.com",
                    "password": "Password123!",
                    "first_name": "Test"
                })
                self.assertNotEqual(res.status_code, 429)

            # 4th request must be throttled with HTTP 429
            res_throttled = self.client.post("/api/auth/register", json={
                "email": f"rate_over_limit_{int(time.time())}@test.com",
                "password": "Password123!",
                "first_name": "Test"
            })
            self.assertEqual(res_throttled.status_code, 429)
            self.assertIn("Too many", res_throttled.json().get("detail", ""))
        finally:
            settings.RATE_LIMIT_AUTH_PER_MIN = original_limit

    def test_05_authenticated_workflows_remain_functional(self):
        """Verifies authenticating and creating sessions remain functional with rate limiter active."""
        user_email = f"auth_flow_res_{int(time.time())}@example.com"
        # Register user
        reg_res = self.client.post("/api/auth/register", json={
            "email": user_email,
            "password": "Password123!",
            "first_name": "Res",
            "username": f"resuser_{int(time.time())}"
        })
        self.assertEqual(reg_res.status_code, 200)

        # Get OTP code from DB
        user = self.db.query(models.User).filter(models.User.email == user_email).first()
        self.assertIsNotNone(user)

        # Verify OTP
        otp_res = self.client.post("/api/auth/verify-otp", json={
            "email": user_email,
            "otp_code": user.otp_code
        })
        self.assertEqual(otp_res.status_code, 200)
        token = otp_res.json()["access_token"]

        # Access authenticated session endpoint
        headers = {"Authorization": f"Bearer {token}"}
        sessions_res = self.client.get("/api/sessions", headers=headers)
        self.assertEqual(sessions_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
