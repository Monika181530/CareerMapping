from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Career, UserCareerGoal, User
from app.schemas.schemas import CareerResponse, CareerWithSkills, CareerGoalCreate, CareerGoalResponse
from app.utils.security import get_current_user
from typing import List

router = APIRouter(tags=["careers"])

@router.get("/api/careers", response_model=List[CareerResponse])
def get_careers(db: Session = Depends(get_db)):
    return db.query(Career).all()

@router.get("/api/careers/{career_id}", response_model=CareerWithSkills)
def get_career_details(career_id: int, db: Session = Depends(get_db)):
    c = db.query(Career).filter(Career.id == career_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    return c

@router.post("/api/career-goal", response_model=CareerGoalResponse)
def set_career_goal(goal: CareerGoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Deactivate old goals
    old_goals = db.query(UserCareerGoal).filter(UserCareerGoal.user_id == current_user.id, UserCareerGoal.is_active == True).all()
    for og in old_goals:
        og.is_active = False
    
    new_goal = UserCareerGoal(user_id=current_user.id, career_id=goal.career_id)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.get("/api/career-goal", response_model=CareerGoalResponse)
def get_career_goal(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(UserCareerGoal).filter(UserCareerGoal.user_id == current_user.id, UserCareerGoal.is_active == True).first()
    if not goal:
        raise HTTPException(status_code=404, detail="No active career goal found")
    return goal
