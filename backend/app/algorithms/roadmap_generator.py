# ROADMAP GENERATOR
# Group skill gaps by priority (Major Gap first, then Needs Improvement)
# Assign phases logically (foundational skills first)
# Estimate weeks per skill based on gap size and proficiency needed

class RoadmapGenerator:
    def generate(self, gap_analysis_result, constraints) -> list:
        # Sort gaps: missing/major first, then needs improvement
        phases = []
        
        # Filter items that actually have gaps
        gaps = [g for g in gap_analysis_result.gaps if g.gap > 0]
        
        # Sort by importance, then by classification severity
        severity_order = {"Missing": 1, "Major Gap": 2, "Needs Improvement": 3}
        gaps.sort(key=lambda x: (severity_order.get(x.classification, 4), -x.importance_weight))
        
        # We can group them into phases (e.g., 3 skills per phase max)
        phase_num = 1
        current_phase_items = []
        
        learning_hours = constraints.learning_hours_per_week if constraints and constraints.learning_hours_per_week else 10
        
        for g in gaps:
            # Estimate weeks: assume 1 level increase takes 10 hours.
            hours_needed = g.gap * 10
            estimated_weeks = max(1, hours_needed // learning_hours)
            
            priority = "High" if g.classification in ["Missing", "Major Gap"] else "Medium"
            
            item = {
                "skill_id": g.skill.id,
                "phase_number": phase_num,
                "priority": priority,
                "current_level": g.student_level,
                "required_level": g.required_level,
                "estimated_weeks": estimated_weeks
            }
            current_phase_items.append(item)
            
            if len(current_phase_items) >= 3:
                phases.extend(current_phase_items)
                phase_num += 1
                current_phase_items = []
                
        if current_phase_items:
            phases.extend(current_phase_items)
            
        return phases
