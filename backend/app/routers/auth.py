from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, Token, UserRoleUpdate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import require_admin, get_current_user

router = APIRouter()


# ── POST /auth/register — ADMIN ONLY ────────────────────────
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),   # 🔒 Admin only
):
    """
    Admin only — create a new user account.
    Role can be 'employee' or 'support_agent' (defaults to 'employee').
    Admin accounts cannot be created via this endpoint.
    """
    if payload.role == UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create admin accounts via this endpoint",
        )

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
        role=payload.role or UserRole.employee,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── POST /auth/login ─────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate with email + password.
    In the 'username' field enter your email.
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


# ── GET /auth/me ─────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently logged-in user's profile."""
    return current_user


# ── GET /auth/users — ADMIN ONLY ─────────────────────────────
@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin only — list all users."""
    return db.query(User).order_by(User.id).all()


# ── PATCH /auth/users/{id}/role — ADMIN ONLY ─────────────────
@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin only — change a user's role."""
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