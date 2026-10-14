from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, Date, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    password_display = Column(String, nullable=True)
    role = Column(String, default="student")
    education = Column(String)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    skills = relationship("UserSkill", back_populates="user")
    goals = relationship("UserCareerGoal", back_populates="user")
    interests = relationship("UserInterest", back_populates="user")
    constraints = relationship("UserConstraint", uselist=False, back_populates="user")
    roadmaps = relationship("Roadmap", back_populates="user")
    monitoring = relationship("CareerMonitoring", back_populates="user")
    recovery = relationship("CareerRecovery", back_populates="user")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String, unique=True, index=True)
    category = Column(String)
    description = Column(Text)

class UserSkill(Base):
    __tablename__ = "user_skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    proficiency_level = Column(Integer)
    status = Column(String, default='active')
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")

class Career(Base):
    __tablename__ = "careers"
    id = Column(Integer, primary_key=True, index=True)
    career_name = Column(String, unique=True, index=True)
    description = Column(Text)
    industry = Column(String)
    avg_salary_range = Column(String)
    career_skills = relationship("CareerSkill", back_populates="career")

class CareerSkill(Base):
    __tablename__ = "career_skills"
    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    importance_weight = Column(Numeric(3, 2))
    required_level = Column(Integer)
    career = relationship("Career", back_populates="career_skills")
    skill = relationship("Skill")

class UserCareerGoal(Base):
    __tablename__ = "user_career_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    career_id = Column(Integer, ForeignKey("careers.id"))
    selected_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    user = relationship("User", back_populates="goals")
    career = relationship("Career")

class UserInterest(Base):
    __tablename__ = "user_interests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interest = Column(String)
    user = relationship("User", back_populates="interests")

class UserConstraint(Base):
    __tablename__ = "user_constraints"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    learning_hours_per_week = Column(Integer)
    career_deadline = Column(Date)
    preferred_learning_mode = Column(String)
    career_preferences = Column(Text)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="constraints")

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    career_id = Column(Integer, ForeignKey("careers.id"))
    generated_at = Column(DateTime, default=func.now())
    total_phases = Column(Integer)
    is_active = Column(Boolean, default=True)
    user = relationship("User", back_populates="roadmaps")
    career = relationship("Career")
    items = relationship("RoadmapItem", back_populates="roadmap")

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    phase_number = Column(Integer)
    priority = Column(String)
    current_level = Column(Integer)
    required_level = Column(Integer)
    estimated_weeks = Column(Integer)
    status = Column(String, default='pending')
    roadmap = relationship("Roadmap", back_populates="items")
    skill = relationship("Skill")

class CareerMonitoring(Base):
    __tablename__ = "career_monitoring"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    career_id = Column(Integer, ForeignKey("careers.id"))
    skill_match_pct = Column(Numeric(5, 2))
    feasibility_status = Column(String)
    monitored_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="monitoring")
    career = relationship("Career")

class CareerRecovery(Base):
    __tablename__ = "career_recovery"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original_career_id = Column(Integer, ForeignKey("careers.id"))
    alternative_career_id = Column(Integer, ForeignKey("careers.id"))
    skill_reuse_score = Column(Numeric(5, 2))
    additional_learning_effort = Column(Integer)
    recovery_score = Column(Numeric(5, 2))
    estimated_months = Column(Integer)
    is_recommended = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="recovery")
    original_career = relationship("Career", foreign_keys=[original_career_id])
    alternative_career = relationship("Career", foreign_keys=[alternative_career_id])

class TransferableSkillMapping(Base):
    __tablename__ = "transferable_skill_mappings"
    id = Column(Integer, primary_key=True, index=True)
    from_career_id = Column(Integer, ForeignKey("careers.id"))
    to_career_id = Column(Integer, ForeignKey("careers.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    transfer_weight = Column(Numeric(3, 2))
