from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.database import get_db
from app.models.models import (
    User, Skill, Career, CareerSkill, UserSkill,
    UserCareerGoal, UserConstraint, UserInterest,
    Roadmap, RoadmapItem, CareerMonitoring, CareerRecovery
)
from app.schemas.schemas import UserAdminCreate, UserAdminUpdate
from app.utils.security import get_current_user, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure that the requester has administrative privileges."""
    if (current_user.role or "").lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required."
        )
    return current_user

@router.get("/overview")
def get_admin_overview(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Summary metrics of the portal."""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role != "admin").count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    total_skills = db.query(Skill).count()
    total_careers = db.query(Career).count()
    total_goals = db.query(UserCareerGoal).filter(UserCareerGoal.is_active == True).count()
    onboarded_count = db.query(User).filter(User.onboarding_completed == True).count()

    # Feasibility breakdown
    monitoring_records = db.query(CareerMonitoring).order_by(CareerMonitoring.monitored_at.desc()).all()
    # Distinct per user
    user_latest_status = {}
    for m in monitoring_records:
        if m.user_id not in user_latest_status:
            user_latest_status[m.user_id] = m.feasibility_status or "Feasible"

    feasible_count = sum(1 for s in user_latest_status.values() if s == "Feasible")
    needs_review_count = sum(1 for s in user_latest_status.values() if s == "Needs Review")
    not_feasible_count = sum(1 for s in user_latest_status.values() if s == "Not Feasible")

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_admins": total_admins,
        "total_skills": total_skills,
        "total_careers": total_careers,
        "total_goals": total_goals,
        "onboarded_count": onboarded_count,
        "feasibility_distribution": {
            "feasible": feasible_count,
            "needs_review": needs_review_count,
            "not_feasible": not_feasible_count,
            "not_evaluated": max(0, total_students - len(user_latest_status))
        }
    }

@router.get("/users")
def get_all_users(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Fetch all users with passwords and comprehensive profile metadata."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []

    for u in users:
        # Target Goal
        goal = db.query(UserCareerGoal).filter(
            UserCareerGoal.user_id == u.id,
            UserCareerGoal.is_active == True
        ).first()
        career_goal = None
        if goal and goal.career:
            career_goal = {
                "id": goal.career.id,
                "name": goal.career.career_name,
                "industry": goal.career.industry,
                "salary": goal.career.avg_salary_range
            }

        # Latest Feasibility & Match %
        latest_mon = db.query(CareerMonitoring).filter(
            CareerMonitoring.user_id == u.id
        ).order_by(CareerMonitoring.monitored_at.desc()).first()

        # Constraints
        constraints = db.query(UserConstraint).filter(UserConstraint.user_id == u.id).first()

        # Interests
        interests = [i.interest for i in db.query(UserInterest).filter(UserInterest.user_id == u.id).all()]

        # Skills count
        skills_count = db.query(UserSkill).filter(UserSkill.user_id == u.id).count()

        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "password": u.password_display or "(Managed via hash)",
            "role": u.role or "student",
            "education": u.education,
            "onboarding_completed": bool(u.onboarding_completed),
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "career_goal": career_goal,
            "feasibility_status": latest_mon.feasibility_status if latest_mon else "Not Evaluated",
            "skill_match_pct": float(latest_mon.skill_match_pct) if (latest_mon and latest_mon.skill_match_pct is not None) else None,
            "skills_count": skills_count,
            "learning_hours_per_week": constraints.learning_hours_per_week if constraints else None,
            "career_deadline": constraints.career_deadline.isoformat() if (constraints and constraints.career_deadline) else None,
            "interests": interests
        })

    return results

@router.get("/users/{user_id}")
def get_user_dossier(user_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Deep academic and skill dossier for a specific student."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # User Skills with Skill details
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    user_skills_list = []
    for us in skills:
        user_skills_list.append({
            "skill_id": us.skill_id,
            "skill_name": us.skill.skill_name if us.skill else f"Skill #{us.skill_id}",
            "category": us.skill.category if us.skill else "General",
            "proficiency_level": us.proficiency_level,
            "status": us.status
        })

    # Constraints
    constraints = db.query(UserConstraint).filter(UserConstraint.user_id == user_id).first()
    constraints_dict = None
    if constraints:
        constraints_dict = {
            "learning_hours_per_week": constraints.learning_hours_per_week,
            "career_deadline": constraints.career_deadline.isoformat() if constraints.career_deadline else None,
            "preferred_learning_mode": constraints.preferred_learning_mode,
            "career_preferences": constraints.career_preferences
        }

    # Interests
    interests = [i.interest for i in db.query(UserInterest).filter(UserInterest.user_id == user_id).all()]

    # Career Goal
    goal = db.query(UserCareerGoal).filter(
        UserCareerGoal.user_id == user_id,
        UserCareerGoal.is_active == True
    ).first()
    goal_dict = None
    if goal and goal.career:
        goal_dict = {
            "career_id": goal.career.id,
            "career_name": goal.career.career_name,
            "industry": goal.career.industry,
            "description": goal.career.description,
            "salary": goal.career.avg_salary_range,
            "selected_at": goal.selected_at.isoformat() if goal.selected_at else None
        }

    # Active Roadmap
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user_id,
        Roadmap.is_active == True
    ).order_by(Roadmap.generated_at.desc()).first()

    roadmap_dict = None
    if roadmap:
        items = db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == roadmap.id).order_by(RoadmapItem.phase_number).all()
        roadmap_dict = {
            "roadmap_id": roadmap.id,
            "career_name": roadmap.career.career_name if roadmap.career else "Target Role",
            "total_phases": roadmap.total_phases,
            "items": [
                {
                    "item_id": it.id,
                    "skill_name": it.skill.skill_name if it.skill else f"Skill #{it.skill_id}",
                    "phase_number": it.phase_number,
                    "priority": it.priority,
                    "current_level": it.current_level,
                    "required_level": it.required_level,
                    "estimated_weeks": it.estimated_weeks,
                    "status": it.status
                }
                for it in items
            ]
        }

    # Latest Recovery Recommendations
    recoveries = db.query(CareerRecovery).filter(CareerRecovery.user_id == user_id).order_by(CareerRecovery.recovery_score.desc()).limit(5).all()
    recovery_list = [
        {
            "alternative_career": rec.alternative_career.career_name if rec.alternative_career else "Role",
            "skill_reuse_score": float(rec.skill_reuse_score) if rec.skill_reuse_score is not None else 0,
            "recovery_score": float(rec.recovery_score) if rec.recovery_score is not None else 0,
            "estimated_months": rec.estimated_months,
            "is_recommended": rec.is_recommended
        }
        for rec in recoveries
    ]

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password": user.password_display or "(Managed via hash)",
            "role": user.role or "student",
            "education": user.education,
            "onboarding_completed": bool(user.onboarding_completed),
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "skills": user_skills_list,
        "constraints": constraints_dict,
        "interests": interests,
        "career_goal": goal_dict,
        "roadmap": roadmap_dict,
        "recovery_recommendations": recovery_list
    }

@router.post("/users")
def create_user_by_admin(data: UserAdminCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin can create a new student or admin user."""
    clean_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_user = User(
        name=data.name.strip(),
        email=clean_email,
        password_hash=get_password_hash(data.password),
        password_display=data.password,
        role=data.role or "student",
        education=data.education,
        onboarding_completed=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": f"User '{new_user.name}' ({new_user.role}) created successfully.",
        "user_id": new_user.id
    }

@router.put("/users/{user_id}")
def update_user_by_admin(user_id: int, data: UserAdminUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin can edit user details, role, or reset password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if data.name is not None:
        user.name = data.name.strip()
    if data.email is not None:
        clean_email = data.email.strip().lower()
        # Verify unique
        conflict = db.query(User).filter(User.email.ilike(clean_email), User.id != user_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Another user already has this email.")
        user.email = clean_email
    if data.password:
        user.password_hash = get_password_hash(data.password)
        user.password_display = data.password
    if data.education is not None:
        user.education = data.education
    if data.role is not None:
        user.role = data.role
    if data.onboarding_completed is not None:
        user.onboarding_completed = data.onboarding_completed

    db.commit()
    return {"message": f"User #{user_id} updated successfully."}

@router.delete("/users/{user_id}")
def delete_user_by_admin(user_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin can delete a student and cascade cleanup their records."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Cleanup child records
    db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()
    db.query(UserCareerGoal).filter(UserCareerGoal.user_id == user_id).delete()
    db.query(UserConstraint).filter(UserConstraint.user_id == user_id).delete()
    db.query(UserInterest).filter(UserInterest.user_id == user_id).delete()
    
    # Roadmaps & items
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id).all()
    for rm in roadmaps:
        db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == rm.id).delete()
    db.query(Roadmap).filter(Roadmap.user_id == user_id).delete()

    db.query(CareerMonitoring).filter(CareerMonitoring.user_id == user_id).delete()
    db.query(CareerRecovery).filter(CareerRecovery.user_id == user_id).delete()

    db.delete(user)
    db.commit()

    return {"message": f"User '{user.name}' and all associated records deleted successfully."}
