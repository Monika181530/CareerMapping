from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.database import get_db
from app.models.models import User, CareerMonitoring, UserCareerGoal, CareerSkill, UserSkill, UserConstraint, Roadmap, RoadmapItem
from app.utils.security import get_current_user
from app.algorithms.skill_gap_engine import SkillGapEngine

router = APIRouter(prefix="/api/career-monitoring", tags=["monitoring"])
gap_engine = SkillGapEngine()

class MonitoringUpdateRequest(BaseModel):
    learning_hours_per_week: Optional[int] = None
    career_deadline: Optional[str] = None

def parse_date(val: Optional[str]) -> Optional[date]:
    if not val or not str(val).strip():
        return None
    if isinstance(val, date):
        return val
    val_str = str(val).strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(val_str, fmt).date()
        except ValueError:
            continue
    return None

@router.get("")
def get_monitoring_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve full live career monitoring data for the student."""
    goal = db.query(UserCareerGoal).filter(UserCareerGoal.user_id == current_user.id, UserCareerGoal.is_active == True).first()
    if not goal:
        return {"has_goal": False, "status": "No active career goal found."}
    
    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == goal.career_id).all()
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    constraints = db.query(UserConstraint).filter(UserConstraint.user_id == current_user.id).first()
    
    res = gap_engine.analyze(user_skills, career_skills)
    
    learning_hours = constraints.learning_hours_per_week if (constraints and constraints.learning_hours_per_week) else 15
    
    # Calculate estimated learning weeks needed for all gaps
    total_gap_units = sum(g.gap for g in res.gaps if g.gap > 0)
    weeks_needed = max(1, round((total_gap_units * 10) / max(learning_hours, 1)))
    
    # Available weeks from deadline
    if constraints and constraints.career_deadline:
        today = date.today()
        deadline = constraints.career_deadline
        if isinstance(deadline, str):
            deadline = parse_date(deadline) or (today + timedelta(days=365))
        delta_days = (deadline - today).days
        available_weeks = max(1, delta_days // 7)
    else:
        available_weeks = 52

    # Feasibility ratio: available weeks vs weeks needed
    time_ratio = available_weeks / max(weeks_needed, 1)
    match_pct = res.match_percentage
    
    if time_ratio >= 1.0 and match_pct >= 30:
        feasibility = "Feasible"
        reason = f"You have {available_weeks} weeks available until your deadline, which is sufficient for the {weeks_needed} weeks of estimated learning required."
    elif time_ratio >= 0.6:
        feasibility = "Needs Review"
        reason = f"You need ~{weeks_needed} weeks of learning at {learning_hours} hrs/week, but only have {available_weeks} weeks available. Consider increasing weekly study hours."
    else:
        feasibility = "Not Feasible"
        reason = f"Your deadline is in {available_weeks} weeks, but your remaining skill gaps require ~{weeks_needed} weeks of study. Explore Career Recovery for alternative roles."
        
    # Get active roadmap progress
    rm = db.query(Roadmap).filter(Roadmap.user_id == current_user.id, Roadmap.is_active == True).first()
    progress_pct = 0
    if rm:
        items = db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == rm.id).all()
        if items:
            completed = len([i for i in items if i.status == 'completed'])
            progress_pct = round((completed / len(items)) * 100, 2)

    # Save monitoring record
    mon = CareerMonitoring(
        user_id=current_user.id,
        career_id=goal.career_id,
        skill_match_pct=match_pct,
        feasibility_status=feasibility
    )
    db.add(mon)
    db.commit()
    db.refresh(mon)
    
    return {
        "has_goal": True,
        "career_id": goal.career_id,
        "career_name": goal.career.career_name,
        "career_description": goal.career.description,
        "skill_match_pct": match_pct,
        "total_gaps": len([g for g in res.gaps if g.gap > 0]),
        "roadmap_progress_pct": progress_pct,
        "feasibility_status": feasibility,
        "feasibility_reason": reason,
        "weeks_needed": weeks_needed,
        "available_weeks": available_weeks,
        "learning_hours_per_week": learning_hours,
        "career_deadline": str(constraints.career_deadline) if (constraints and constraints.career_deadline) else None,
        "monitored_at": mon.monitored_at.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.post("/update")
def update_monitoring(body: MonitoringUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update learning hours / deadline and recalculate feasibility."""
    constraints = db.query(UserConstraint).filter(UserConstraint.user_id == current_user.id).first()
    if not constraints:
        constraints = UserConstraint(user_id=current_user.id)
        db.add(constraints)
    
    if body.learning_hours_per_week is not None:
        constraints.learning_hours_per_week = body.learning_hours_per_week
    if body.career_deadline is not None:
        parsed = parse_date(body.career_deadline)
        constraints.career_deadline = parsed
        
    db.commit()
    
    # Recalculate and return fresh data
    return get_monitoring_data(current_user=current_user, db=db)

@router.get("/feasibility")
def get_feasibility(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mon = db.query(CareerMonitoring).filter(CareerMonitoring.user_id == current_user.id).order_by(CareerMonitoring.monitored_at.desc()).first()
    if not mon:
        return {"feasibility_status": "Feasible"}
    return {"feasibility_status": mon.feasibility_status}
