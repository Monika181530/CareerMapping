from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return a JWT token + user info."""
    clean_email = user.email.strip().lower()
    db_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=clean_email,
        password_hash=hashed_password,
        password_display=user.password,
        role=user.role or "student",
        education=user.education
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role or "student",
            "education": new_user.education,
            "onboarding_completed": False
        }
    }

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email/username and password and receive a JWT token."""
    login_id = credentials.email.strip().lower()
    # Check by email directly, or alias 'admin' to 'admin@career.com'
    if login_id == "admin":
        user = db.query(User).filter((User.role == "admin") | (User.email == "admin@career.com")).first()
    else:
        user = db.query(User).filter(User.email.ilike(login_id)).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )
    
    # Check if onboarding is completed
    is_completed = bool(user.onboarding_completed)
    if user.role == "admin":
        is_completed = True
    elif not is_completed and user.goals and len(user.goals) > 0:
        user.onboarding_completed = True
        db.commit()
        is_completed = True

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role or "student",
            "education": user.education,
            "onboarding_completed": is_completed
        }
    }
