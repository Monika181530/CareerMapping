from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Skill, UserSkill, User
from app.schemas.schemas import SkillResponse, UserSkillCreate, UserSkillUpdate, UserSkillResponse
from app.utils.security import get_current_user
from typing import List, Optional

router = APIRouter(tags=["skills"])

@router.get("/api/skills", response_model=List[SkillResponse])
def get_skills(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Skill)
    if category:
        q = q.filter(Skill.category == category)
    return q.all()

@router.get("/api/user-skills", response_model=List[UserSkillResponse])
def get_user_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

@router.post("/api/user-skills", response_model=UserSkillResponse)
def add_user_skill(skill: UserSkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_skill = UserSkill(
        user_id=current_user.id,
        skill_id=skill.skill_id,
        proficiency_level=skill.proficiency_level
    )
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.put("/api/user-skills/{skill_id}", response_model=UserSkillResponse)
def update_user_skill(skill_id: int, skill: UserSkillUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_skill = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db_skill.proficiency_level = skill.proficiency_level
    db_skill.status = skill.status
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/api/user-skills/{skill_id}")
def delete_user_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_skill = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(db_skill)
    db.commit()
    return {"status": "deleted"}

@router.post("/api/user-skills/bulk")
def bulk_add_skills(skills: List[UserSkillCreate], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_skill_ids = {sk.skill_id for sk in skills}
    
    # Remove any skills for this user that are not in the new list
    db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id.not_in(new_skill_ids) if new_skill_ids else True
    ).delete(synchronize_session=False)

    for sk in skills:
        existing = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == sk.skill_id).first()
        if existing:
            existing.proficiency_level = sk.proficiency_level
        else:
            db.add(UserSkill(user_id=current_user.id, skill_id=sk.skill_id, proficiency_level=sk.proficiency_level))
    db.commit()
    return {"status": "success"}
