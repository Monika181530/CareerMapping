from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.database import get_db
from app.models.models import User, UserInterest, UserConstraint
from app.schemas.schemas import UserResponse, InterestCreate, ConstraintsCreate, ConstraintsResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None

@router.get("", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_completed = bool(current_user.onboarding_completed)
    if not is_completed and current_user.goals and len(current_user.goals) > 0:
        current_user.onboarding_completed = True
        db.commit()
        is_completed = True

    return {
        "user_id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "education": current_user.education,
        "onboarding_completed": is_completed
    }

@router.post("/complete-onboarding")
def complete_onboarding(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.onboarding_completed = True
    db.commit()
    return {"status": "success", "onboarding_completed": True}

@router.put("", response_model=UserResponse)
def update_profile(body: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.name is not None:
        current_user.name = body.name
    if body.education is not None:
        current_user.education = body.education
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/interests")
@router.put("/interests")
def set_interests(interests: InterestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(UserInterest).filter(UserInterest.user_id == current_user.id).delete()
    for int_str in interests.interests:
        db.add(UserInterest(user_id=current_user.id, interest=int_str))
    db.commit()
    return {"status": "success", "count": len(interests.interests)}

@router.get("/interests")
def get_interests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ints = db.query(UserInterest).filter(UserInterest.user_id == current_user.id).all()
    return {"interests": [i.interest for i in ints]}

@router.post("/constraints", response_model=ConstraintsResponse)
@router.put("/constraints", response_model=ConstraintsResponse)
def create_or_update_constraints(constraints: ConstraintsCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_constraint = db.query(UserConstraint).filter(UserConstraint.user_id == current_user.id).first()
    if not db_constraint:
        db_constraint = UserConstraint(user_id=current_user.id)
        db.add(db_constraint)
    if constraints.learning_hours_per_week is not None:
        db_constraint.learning_hours_per_week = constraints.learning_hours_per_week
    if constraints.career_deadline is not None:
        db_constraint.career_deadline = constraints.career_deadline
    if constraints.preferred_learning_mode is not None:
        db_constraint.preferred_learning_mode = constraints.preferred_learning_mode
    if constraints.career_preferences is not None:
        db_constraint.career_preferences = constraints.career_preferences
    db.commit()
    db.refresh(db_constraint)
    return db_constraint

@router.get("/constraints")
def get_constraints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_constraint = db.query(UserConstraint).filter(UserConstraint.user_id == current_user.id).first()
    if not db_constraint:
        return {"id": 0, "learning_hours_per_week": 10, "career_deadline": None, "preferred_learning_mode": None, "career_preferences": None, "updated_at": None}
    return db_constraint
