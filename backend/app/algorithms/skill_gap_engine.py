# SKILL GAP ENGINE
# Compares student skill proficiency against career required levels
# Uses weighted scoring to calculate overall match percentage

from app.schemas.schemas import SkillGapAnalysisResult, SkillGapItem, SkillResponse

class SkillGapEngine:
    def analyze(self, user_skills: list, career_skills: list) -> SkillGapAnalysisResult:
        """
        Analyze skill gaps between user skills and career requirements.
        """
        user_skills_dict = {us.skill_id: us.proficiency_level for us in user_skills}
        gaps = []
        
        weighted_achieved = 0.0
        weighted_required = 0.0

        for cs in career_skills:
            skill = cs.skill
            required_level = cs.required_level
            importance = float(cs.importance_weight)
            
            student_level = user_skills_dict.get(skill.id, 0)
            
            # Calculate gap
            if student_level > 0:
                gap = max(0, required_level - student_level)
            else:
                gap = required_level
                
            # Classify gap
            if gap == 0:
                classification = "Strong"
            elif gap <= 2 and student_level > 0:
                classification = "Needs Improvement"
            elif student_level == 0:
                classification = "Missing"
            else:
                classification = "Major Gap"
                
            # Weighted matching
            achieved = min(student_level, required_level)
            weighted_achieved += importance * achieved
            weighted_required += importance * required_level
            
            gap_item = SkillGapItem(
                skill=SkillResponse.from_orm(skill),
                student_level=student_level,
                required_level=required_level,
                importance_weight=importance,
                gap=gap,
                classification=classification
            )
            gaps.append(gap_item)
            
        match_pct = (weighted_achieved / weighted_required * 100) if weighted_required > 0 else 0
        
        return SkillGapAnalysisResult(
            match_percentage=round(match_pct, 2),
            gaps=gaps
        )
