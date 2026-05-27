from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.config import settings

#  Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# bcrypt hard limit — passwords longer than 72 bytes are silently truncated
# by some versions of the library, so we reject them explicitly.
_BCRYPT_MAX_BYTES = 72


def _check_password_length(plain_password: str) -> None:
    if len(plain_password.encode("utf-8")) > _BCRYPT_MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be {_BCRYPT_MAX_BYTES} characters or fewer.",
        )


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    _check_password_length(plain_password)
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check plain password against stored bcrypt hash."""
    _check_password_length(plain_password)
    return pwd_context.verify(plain_password, hashed_password)


# JWT
def create_access_token(data: dict) -> str:
    """
    Create a signed JWT.
    `data` should contain at least {"sub": str(user_id), "role": role_value}
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Decode and verify a JWT.
    Returns the payload dict, or None if invalid / expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None