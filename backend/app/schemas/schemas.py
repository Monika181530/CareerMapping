from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime

class UserBase(BaseModel):
    name: str
    email: str
    education: Optional[str] = None
    role: Optional[str] = "student"
    onboarding_completed: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str = "student"
    onboarding_completed: bool = False
    created_at: datetime
    class Config:
        from_attributes = True

class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    education: Optional[str] = None
    role: Optional[str] = None
    onboarding_completed: Optional[bool] = None

class UserAdminCreate(BaseModel):
    name: str
    email: str
    password: str
    education: Optional[str] = "B.E / B.Tech"
    role: Optional[str] = "student"

class Token(BaseModel):
    access_token: str
    token_type: str

class SkillBase(BaseModel):
    skill_name: str
    category: Optional[str] = None
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

class UserSkillBase(BaseModel):
    skill_id: int
    proficiency_level: int

class UserSkillCreate(UserSkillBase):
    pass

class UserSkillUpdate(BaseModel):
    proficiency_level: int
    status: Optional[str] = 'active'

class UserSkillResponse(UserSkillBase):
    id: int
    status: str
    updated_at: datetime
    skill: SkillResponse
    class Config:
        from_attributes = True

class CareerSkillBase(BaseModel):
    skill_id: int
    importance_weight: float
    required_level: int

class CareerSkillResponse(CareerSkillBase):
    id: int
    skill: SkillResponse
    class Config:
        from_attributes = True

class CareerBase(BaseModel):
    career_name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    avg_salary_range: Optional[str] = None

class CareerResponse(CareerBase):
    id: int
    class Config:
        from_attributes = True

class CareerWithSkills(CareerResponse):
    career_skills: List[CareerSkillResponse]

class CareerGoalCreate(BaseModel):
    career_id: int

class CareerGoalResponse(BaseModel):
    id: int
    career: CareerResponse
    selected_at: datetime
    is_active: bool
    class Config:
        from_attributes = True

class InterestCreate(BaseModel):
    interests: List[str]

class ConstraintsBase(BaseModel):
    learning_hours_per_week: Optional[int] = None
    career_deadline: Optional[date] = None
    preferred_learning_mode: Optional[str] = None
    career_preferences: Optional[str] = None

class ConstraintsCreate(ConstraintsBase):
    pass

class ConstraintsResponse(ConstraintsBase):
    id: int
    updated_at: datetime
    class Config:
        from_attributes = True

class SkillGapItem(BaseModel):
    skill: SkillResponse
    student_level: int
    required_level: int
    importance_weight: float
    gap: int
    classification: str

class SkillGapAnalysisResult(BaseModel):
    match_percentage: float
    gaps: List[SkillGapItem]

class RoadmapItemResponse(BaseModel):
    id: int
    skill: SkillResponse
    phase_number: int
    priority: str
    current_level: int
    required_level: int
    estimated_weeks: int
    status: str
    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    id: int
    career: CareerResponse
    generated_at: datetime
    total_phases: int
    items: List[RoadmapItemResponse]
    class Config:
        from_attributes = True

class AlternativeCareerResult(BaseModel):
    career: CareerResponse
    skill_reuse_score: float
    effort_score: float
    recovery_score: float
    estimated_months: int
    estimated_weeks: Optional[int] = 4
    existing_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    interest_match_pct: Optional[float] = 50.0
    feasibility_status: Optional[str] = "Feasible"
    reasoning: str
    class Config:
        from_attributes = True

class CareerRecoveryResponse(BaseModel):
    original_career: CareerResponse
    alternatives: List[AlternativeCareerResult]
    
class RecoveryAnalysisRequest(BaseModel):
    include_interests: bool = True

class ComparisonRequest(BaseModel):
    career_ids: List[int]

class ComparisonResult(BaseModel):
    careers: List[CareerWithSkills]
