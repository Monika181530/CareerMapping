# CAREER RECOVERY ENGINE
# Dynamic rule-based career recovery algorithm
#
# Calculates:
# 1. Skill Reuse Score (weighted sum of reusable student skills)
# 2. Reusable Skills & Missing Skills lists
# 3. Additional Learning Effort & Estimated Months
# 4. Time Feasibility % based on student deadline
# 5. Interest Match % & Preference Match %
# 6. Composite Recovery Score (weighted formula)
# 7. Human-readable explainable reasoning

class CareerRecoveryEngine:
    def analyze(self, user_skills: list, all_careers: list, all_career_skills: list, constraints, user_interests: list) -> list:
        results = []
        user_skills_dict = {us.skill_id: us.proficiency_level for us in user_skills}
        user_skills_name_map = {us.skill_id: us.skill.skill_name for us in user_skills if us.skill}
        interest_set = set(user_interests)
        
        learning_hours_per_week = constraints.learning_hours_per_week if constraints and constraints.learning_hours_per_week else 15
        
        # Calculate available weeks from deadline
        if constraints and constraints.career_deadline:
            import datetime
            delta = constraints.career_deadline - datetime.date.today()
            available_weeks = max(1, delta.days // 7)
        else:
            available_weeks = 52

        for career in all_careers:
            career_skills = [cs for cs in all_career_skills if cs.career_id == career.id]
            if not career_skills:
                continue

            reusable_score = 0.0
            total_required = 0.0
            
            existing_skills = []
            missing_skills = []
            
            missing_count = 0
            gap_weeks_total = 0
            
            for cs in career_skills:
                weight = float(cs.importance_weight)
                req_lvl = cs.required_level
                total_required += weight * req_lvl
                
                stu_lvl = user_skills_dict.get(cs.skill_id, 0)
                skill_name = cs.skill.skill_name if cs.skill else f"Skill #{cs.skill_id}"
                
                if stu_lvl > 0:
                    reusable_score += weight * min(stu_lvl, req_lvl)
                    existing_skills.append(skill_name)
                    
                    if stu_lvl < req_lvl:
                        gap = req_lvl - stu_lvl
                        gap_weeks_total += max(1, (gap * 10) // learning_hours_per_week)
                else:
                    missing_skills.append(skill_name)
                    missing_count += 1
            
            skill_reuse_score = (reusable_score / total_required * 100) if total_required > 0 else 0.0
            
            # ADDITIONAL LEARNING EFFORT & ESTIMATED TIME
            estimated_weeks = missing_count * 3 + gap_weeks_total
            effort_score = float(estimated_weeks)
            
            # TIME FEASIBILITY
            time_feasibility = min(1.0, available_weeks / max(estimated_weeks, 1)) * 100
            
            feasibility_status = "Feasible"
            if time_feasibility < 50 or skill_reuse_score < 40:
                feasibility_status = "At Risk"
            elif time_feasibility < 80 or skill_reuse_score < 60:
                feasibility_status = "Needs Review"

            # INTEREST MATCH %
            interest_match_score = 0.0
            if interest_set:
                matched_interests = [i for i in interest_set if i.lower() in career.industry.lower() or i.lower() in career.career_name.lower() or i.lower() in (career.description or "").lower()]
                interest_match_score = min(100.0, (len(matched_interests) / max(1, len(interest_set))) * 100 + (50 if matched_interests else 0))
            else:
                interest_match_score = 50.0

            # PREFERENCE MATCH
            preference_match_score = 70.0
            
            # COMPOSITE RECOVERY SCORE FORMULA
            learning_penalty = estimated_weeks * 0.4
            raw_recovery_score = (
                0.40 * skill_reuse_score + 
                0.25 * time_feasibility + 
                0.20 * interest_match_score + 
                0.15 * preference_match_score
            ) - learning_penalty
            
            recovery_score = max(0.0, min(100.0, raw_recovery_score))
            estimated_months = max(1, round(estimated_weeks / 4.33))

            # EXPLAINABLE REASONING GENERATION
            if skill_reuse_score >= 70:
                reasoning = f"Your {', '.join(existing_skills[:3])} skills overlap strongly with {career.career_name}. Only ~{estimated_months} month(s) needed to bridge remaining gaps."
            elif skill_reuse_score >= 50:
                reasoning = f"Reuses {round(skill_reuse_score)}% of your existing skillset ({', '.join(existing_skills[:2])}). Requires acquiring {', '.join(missing_skills[:2])}."
            else:
                reasoning = f"Requires moderate pivoting into {career.industry}. Reuses your foundational skills with ~{estimated_months} month(s) estimated effort."

            results.append({
                "career": career,
                "skill_reuse_score": round(skill_reuse_score, 2),
                "effort_score": round(effort_score, 2),
                "recovery_score": round(recovery_score, 2),
                "estimated_months": estimated_months,
                "estimated_weeks": estimated_weeks,
                "existing_skills": existing_skills,
                "missing_skills": missing_skills,
                "interest_match_pct": round(interest_match_score, 2),
                "feasibility_status": feasibility_status,
                "reasoning": reasoning
            })
            
        # Rank alternatives by recovery_score DESC
        results.sort(key=lambda x: x["recovery_score"], reverse=True)
        return results
