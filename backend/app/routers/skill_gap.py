from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import UserCareerGoal, CareerSkill, UserSkill, User
from app.schemas.schemas import SkillGapAnalysisResult
from app.utils.security import get_current_user
from app.algorithms.skill_gap_engine import SkillGapEngine

router = APIRouter(prefix="/api/skill-gap", tags=["skill-gap"])
engine = SkillGapEngine()

@router.post("/analyze", response_model=SkillGapAnalysisResult)
def analyze_skill_gap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Analyze skill gaps between user skills and their career goal requirements."""
    goal = db.query(UserCareerGoal).filter(
        UserCareerGoal.user_id == current_user.id, UserCareerGoal.is_active == True
    ).first()
    if not goal:
        raise HTTPException(status_code=400, detail="No active career goal. Please set a career goal first.")
    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == goal.career_id).all()
    if not career_skills:
        raise HTTPException(status_code=400, detail="No skill requirements found for the selected career.")
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    result = engine.analyze(user_skills, career_skills)
    return result

@router.get("/summary")
def get_skill_gap_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Quick summary of skill gap for dashboard display - includes top gaps for charts."""
    goal = db.query(UserCareerGoal).filter(
        UserCareerGoal.user_id == current_user.id, UserCareerGoal.is_active == True
    ).first()
    if not goal:
        return {"has_goal": False, "match_percentage": 0, "gaps": []}
    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == goal.career_id).all()
    if not career_skills:
        return {"has_goal": True, "career_name": goal.career.career_name, "match_percentage": 0, "gaps": []}
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    result = engine.analyze(user_skills, career_skills)
    # Build lightweight gap list for dashboard charts
    gap_list = [
        {
            "skill_name": g.skill.skill_name,
            "gap": g.gap,
            "classification": g.classification,
            "student_level": g.student_level,
            "required_level": g.required_level
        }
        for g in sorted(result.gaps, key=lambda x: x.gap, reverse=True)
        if g.gap > 0
    ]
    return {
        "has_goal": True,
        "career_name": goal.career.career_name,
        "match_percentage": result.match_percentage,
        "total_gaps": len([g for g in result.gaps if g.gap > 0]),
        "missing_skills": len([g for g in result.gaps if g.classification == 'Missing']),
        "gaps": gap_list  # Top gaps for charts
    }
