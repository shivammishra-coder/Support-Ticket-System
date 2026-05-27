from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

# Tells FastAPI where to find the token (used in Swagger UI too)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


#  Base dependency 
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode JWT → look up user in DB.
    Raises 401 if token is missing, invalid, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user


# Role guard dependencies 
def require_employee(current_user: User = Depends(get_current_user)) -> User:
    """Any authenticated user passes (all roles are at least employees)."""
    return current_user


def require_agent(current_user: User = Depends(get_current_user)) -> User:
    """Only support_agent or admin."""
    if current_user.role not in (UserRole.support_agent, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Support agent or admin access required",
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Only admin."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user