# Eloquent One — Backend Automated Regression Test Suite

This directory contains the automated regression test suite for the **Eloquent One AI Communication Intelligence Platform**.

## Test Modules Overview

1. **`test_app_startup.py`**: Verifies root endpoint, health check (`/api/health`), CORS headers, and database table creation.
2. **`test_auth_flow.py`**: Verifies local registration schema validation, OTP email verification, OAuth2 password login, profile retrieval (`/api/auth/me`), and unauthorized access rejections.
3. **`test_caf_scoring.py`**: Verifies Communication Assessment Framework (CAF) speech pace WPM, filler word penalties, eye contact %, smile %, gesture visibility %, 70-point composite technical scoring, and local context-aware coaching engine.
4. **`test_jwt_expiration.py`**: Verifies standardized 7-day token expiration lifetime (`ACCESS_TOKEN_EXPIRE_MINUTES`) and custom delta overrides.
5. **`test_jwt_secret_management.py`**: Verifies environment variable secret configuration, production startup failure on missing/default secrets, and local dev fallbacks.
6. **`test_session_authorization.py`**: Verifies ownership authorization for session viewing (`GET /api/session/{id}`) and session deletion (`DELETE /api/session/{id}`) with 404 Not Found enumeration protection.
7. **`test_session_endpoints.py`**: Verifies session listing, detail retrieval, audio WebM recording upload, audio deletion, and session database removal.
8. **`test_websocket_session_lifecycle.py`**: Verifies real-time WebSocket connection, frame-by-frame telemetry streaming, live transcription, disconnect handling, and background database session (`SessionLocal`) persistence isolation.

## Running Tests

From the `backend` directory, run:

```bash
# Run all tests using the unified runner:
python run_regression_tests.py

# Or via standard unittest module:
python -m unittest discover -s tests -p "test_*.py"
```
