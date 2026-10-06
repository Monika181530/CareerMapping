from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.database import get_db
from app.models.models import UserCareerGoal, CareerSkill, UserSkill, User, Roadmap, RoadmapItem, UserConstraint
from app.schemas.schemas import RoadmapResponse
from app.utils.security import get_current_user
from app.algorithms.skill_gap_engine import SkillGapEngine
from app.algorithms.roadmap_generator import RoadmapGenerator

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])
gap_engine = SkillGapEngine()
roadmap_gen = RoadmapGenerator()

class StatusUpdate(BaseModel):
    status: str

@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate a personalized roadmap based on skill gap analysis."""
    goal = db.query(UserCareerGoal).filter(
        UserCareerGoal.user_id == current_user.id,
        UserCareerGoal.is_active == True
    ).first()
    if not goal:
        raise HTTPException(status_code=400, detail="No active career goal. Please set a career goal first.")
    
    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == goal.career_id).all()
    if not career_skills:
        raise HTTPException(status_code=400, detail="No skill requirements found for this career.")
    
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    constraints = db.query(UserConstraint).filter(UserConstraint.user_id == current_user.id).first()
    
    # Run skill gap analysis
    analysis = gap_engine.analyze(user_skills, career_skills)
    # Generate phase-based roadmap from gaps
    roadmap_items_data = roadmap_gen.generate(analysis, constraints)
    
    if not roadmap_items_data:
        raise HTTPException(status_code=400, detail="No skill gaps found. Your skills already meet the career requirements!")
    
    # Deactivate old roadmaps
    db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id, Roadmap.is_active == True
    ).update({"is_active": False})
    
    total_phases = max([i["phase_number"] for i in roadmap_items_data])
    
    new_roadmap = Roadmap(
        user_id=current_user.id,
        career_id=goal.career_id,
        total_phases=total_phases
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)
    
    for item in roadmap_items_data:
        db_item = RoadmapItem(
            roadmap_id=new_roadmap.id,
            skill_id=item["skill_id"],
            phase_number=item["phase_number"],
            priority=item["priority"],
            current_level=item["current_level"],
            required_level=item["required_level"],
            estimated_weeks=item["estimated_weeks"]
        )
        db.add(db_item)
    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

@router.get("", response_model=RoadmapResponse)
def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get active roadmap for current user."""
    rm = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id, Roadmap.is_active == True
    ).first()
    if not rm:
        raise HTTPException(status_code=404, detail="No active roadmap found. Generate one first.")
    return rm

@router.put("/items/{item_id}")
def update_roadmap_item(item_id: int, body: StatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update status of a roadmap item (pending/in-progress/completed)."""
    item = db.query(RoadmapItem).join(Roadmap).filter(
        RoadmapItem.id == item_id, Roadmap.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found.")
    valid_statuses = ["pending", "in-progress", "completed"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")
    item.status = body.status
    db.commit()
    return {"status": "success", "item_id": item_id, "new_status": body.status}

@router.get("/progress")
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get roadmap completion progress with item details."""
    rm = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id, Roadmap.is_active == True
    ).first()
    if not rm:
        return {"completion_pct": 0, "items": [], "has_roadmap": False, "total": 0, "completed": 0}
    
    items = db.query(RoadmapItem).filter(
        RoadmapItem.roadmap_id == rm.id
    ).order_by(RoadmapItem.phase_number, RoadmapItem.priority).all()
    
    if not items:
        return {"completion_pct": 0, "items": [], "has_roadmap": True, "total": 0, "completed": 0}
    
    completed_count = len([i for i in items if i.status == "completed"])
    items_data = [
        {
            "id": i.id,
            "skill_name": i.skill.skill_name,
            "phase": i.phase_number,
            "status": i.status,
            "priority": i.priority,
            "estimated_weeks": i.estimated_weeks,
            "current_level": i.current_level,
            "required_level": i.required_level
        } for i in items
    ]
    return {
        "completion_pct": round((completed_count / len(items)) * 100, 2),
        "total": len(items),
        "completed": completed_count,
        "has_roadmap": True,
        "career_name": rm.career.career_name,
        "items": items_data
    }
