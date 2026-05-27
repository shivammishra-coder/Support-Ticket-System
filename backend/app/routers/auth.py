from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, Token, UserRoleUpdate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import require_admin, get_current_user

router = APIRouter()


# ── POST /auth/register
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user. Default role is 'employee'.
    Admin can later promote users via PATCH /auth/users/{id}/role.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.employee,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# POST /auth/login
@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return a JWT access token.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


# GET /auth/me
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently logged-in user's profile."""
    return current_user


# PATCH /auth/users/{id}/role
@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Admin only — assign or change a user's role.
    e.g. promote employee → support_agent
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user