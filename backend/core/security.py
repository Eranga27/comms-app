from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import User
import os

DEFAULT_DEV_SECRET = "eloquent_one_dev_secret_key_local_only"

def get_jwt_secret() -> str:
    """
    Loads the JWT secret key from environment.
    If running in production (ENVIRONMENT=production/prod), a missing or default secret key
    will raise a RuntimeError to prevent insecure deployment.
    """
    secret = os.getenv("JWT_SECRET_KEY", "").strip()
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower()
    is_production = env in ("production", "prod")

    if not secret:
        if is_production:
            raise RuntimeError(
                "CRITICAL CONFIGURATION ERROR: JWT_SECRET_KEY environment variable is missing. "
                "Production deployment cannot start without a secure JWT secret key."
            )
        secret = DEFAULT_DEV_SECRET

    if is_production and secret in (DEFAULT_DEV_SECRET, "eloquent_one_super_secret_key_change_me_in_prod"):
        raise RuntimeError(
            "CRITICAL CONFIGURATION ERROR: Insecure or default JWT secret key cannot be used in production."
        )

    return secret

SECRET_KEY = get_jwt_secret()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    if not plain_password or not hashed_password: return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, get_jwt_secret(), algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
