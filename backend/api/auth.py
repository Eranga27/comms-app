import random
import string
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import httpx
import os

from core.database import get_db
from core.models import User
from core.security import verify_password, get_password_hash, create_access_token, get_current_user
from core.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))

# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    username: Optional[str] = None

    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Please enter a valid email address.')
        return v

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters.')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter.')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number.')
        return v

    @field_validator('first_name')
    @classmethod
    def name_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters.')
        return v.strip() if v else v


class OtpVerify(BaseModel):
    email: str
    otp_code: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    auth_provider: str
    is_verified: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class RegisterResponse(BaseModel):
    message: str
    email: str


# ── Local Auth ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=RegisterResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email.strip().lower()).first()
    if existing:
        if existing.is_verified == 0:
            # Resend OTP for unverified accounts
            otp = generate_otp()
            existing.otp_code = otp
            db.commit()
            send_otp_email(existing.email, otp)
            return {"message": "Account exists but is not verified. A new code has been sent to your email.", "email": existing.email}
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_password = get_password_hash(user.password)
    username = user.username or user.email.split('@')[0]
    otp = generate_otp()

    db_user = User(
        email=user.email.strip().lower(),
        hashed_password=hashed_password,
        first_name=user.first_name,
        username=username,
        auth_provider="local",
        is_verified=0,
        otp_code=otp,
    )
    db.add(db_user)
    db.commit()

    send_otp_email(db_user.email, otp)
    return {"message": "Account created! Please check your email for the 6-digit verification code.", "email": db_user.email}


@router.post("/verify-otp", response_model=Token)
def verify_otp(payload: OtpVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")
    if user.is_verified == 1:
        raise HTTPException(status_code=400, detail="Account is already verified.")
    if user.otp_code != payload.otp_code:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please try again.")

    user.is_verified = 1
    user.otp_code = None
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username.strip().lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.is_verified == 0:
        # Re-send OTP and ask them to verify
        otp = generate_otp()
        user.otp_code = otp
        db.commit()
        send_otp_email(user.email, otp)
        raise HTTPException(
            status_code=403,
            detail=f"EMAIL_NOT_VERIFIED:{user.email}",
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google/login")
def google_login():
    if not GOOGLE_CLIENT_ID:
        return RedirectResponse(f"{FRONTEND_URL}/?oauth_error=Google+OAuth+is+not+configured+yet.+Please+add+GOOGLE_CLIENT_ID+to+the+server+.env+file.")
    params = (
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={BACKEND_URL.rstrip('/')}/api/auth/google/callback"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
    )
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="Google OAuth not configured.")
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": f"{BACKEND_URL.rstrip('/')}/api/auth/google/callback",
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        user_info = user_res.json()

    email = user_info.get("email")
    google_id = user_info.get("sub")
    first_name = user_info.get("given_name") or user_info.get("name", "").split()[0]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            username=email.split("@")[0],
            first_name=first_name,
            auth_provider="google",
            provider_id=google_id,
            is_verified=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.auth_provider != "google":
        user.auth_provider = "google"
        user.provider_id = google_id
        user.is_verified = 1
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/?token={access_token}")


# ── GitHub OAuth ──────────────────────────────────────────────────────────────

@router.get("/github/login")
def github_login():
    if not GITHUB_CLIENT_ID:
        return RedirectResponse(f"{FRONTEND_URL}/?oauth_error=GitHub+OAuth+is+not+configured+yet.+Please+add+GITHUB_CLIENT_ID+to+the+server+.env+file.")
    params = (
        f"client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={BACKEND_URL.rstrip('/')}/api/auth/github/callback"
        "&scope=user:email"
    )
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured.")
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={"client_id": GITHUB_CLIENT_ID, "client_secret": GITHUB_CLIENT_SECRET, "code": code},
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()
        access = token_data.get("access_token", "")

        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access}"}
        )
        user_info = user_res.json()

        email_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access}"}
        )
        emails = email_res.json()

    primary_email = next((e["email"] for e in emails if e.get("primary")), None)
    github_id = str(user_info.get("id"))
    first_name = (user_info.get("name") or "").split()[0] or user_info.get("login", "")

    user = db.query(User).filter(User.email == primary_email).first()
    if not user:
        user = User(
            email=primary_email,
            username=user_info.get("login"),
            first_name=first_name,
            auth_provider="github",
            provider_id=github_id,
            is_verified=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token(data={"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/?token={jwt_token}")
