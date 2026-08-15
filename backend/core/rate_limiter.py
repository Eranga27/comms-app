import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request

# In-memory timestamp storage: { "bucket:ip": [timestamp1, timestamp2, ...] }
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)

def get_client_ip(request) -> str:
    """Extracts client IP address handling X-Forwarded-For proxy headers for Request or WebSocket."""
    headers = getattr(request, "headers", None)
    if headers:
        forwarded = headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
    client = getattr(request, "client", None)
    if client and getattr(client, "host", None):
        return client.host
    return "127.0.0.1"

def check_rate_limit(bucket: str, ip: str, max_requests: int, window_seconds: int = 60) -> bool:
    """
    Checks if an IP has exceeded request limit within window_seconds.
    Returns True if request is allowed, False if rate limit exceeded.
    """
    now = time.time()
    key = f"{bucket}:{ip}"
    cutoff = now - window_seconds

    # Filter out timestamps older than window
    timestamps = [t for t in _rate_limit_store[key] if t > cutoff]
    _rate_limit_store[key] = timestamps

    if len(timestamps) >= max_requests:
        return False

    _rate_limit_store[key].append(now)
    return True

def reset_rate_limiter():
    """Clears the in-memory rate limit store (useful for unit testing)."""
    global _rate_limit_store
    _rate_limit_store.clear()
