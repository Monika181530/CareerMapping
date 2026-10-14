import os
import datetime
from app.database.database import engine, SessionLocal, Base, init_db
from app.models.models import (
    User, Skill, Career, CareerSkill, UserSkill,
    UserCareerGoal, UserConstraint, UserInterest, TransferableSkillMapping
)
from app.utils.security import get_password_hash

def seed():
    init_db()
    db = SessionLocal()

    # Clear existing
    db.query(TransferableSkillMapping).delete()
    db.query(UserConstraint).delete()
    db.query(UserInterest).delete()
    db.query(UserCareerGoal).delete()
    db.query(UserSkill).delete()
    db.query(CareerSkill).delete()
    db.query(User).delete()
    db.query(Career).delete()
    db.query(Skill).delete()
    db.commit()

    # 1. Skills
    skills_data = [
        ("Java", "Programming", "Object-oriented language for enterprise development"),
        ("Python", "Programming", "High-level language for data science, AI, web backends"),
        ("C", "Programming", "Low-level systems programming language"),
        ("C++", "Programming", "Extension of C with object-oriented features"),
        ("JavaScript", "Web", "Core language for web frontend and Node.js backend"),
        ("React", "Web", "Popular JavaScript library for user interfaces"),
        ("HTML", "Web", "Markup language for structuring web content"),
        ("CSS", "Web", "Stylesheet language for designing web pages"),
        ("SQL", "Database", "Structured query language for relational databases"),
        ("PostgreSQL", "Database", "Advanced open-source relational database system"),
        ("DSA", "Programming", "Data Structures and Algorithms - core CS fundamentals"),
        ("OOP", "Programming", "Object-Oriented Programming concepts and design patterns"),
        ("Git", "DevOps", "Distributed version control system"),
        ("REST API", "Web", "Architectural style for networked application APIs"),
        ("Spring Boot", "Web", "Java framework for microservices and web apps"),
        ("FastAPI", "Web", "Modern Python web framework for building APIs"),
        ("Linux", "DevOps", "Open-source OS widely used in servers"),
        ("Docker", "DevOps", "Containerization platform for packaging applications"),
        ("AWS", "DevOps", "Amazon Web Services cloud computing platform"),
        ("Statistics", "Data Science", "Mathematical analysis of data for inference"),
        ("Machine Learning", "Data Science", "Algorithms that learn patterns from data"),
        ("Data Analysis", "Data Science", "Process of inspecting and modeling data"),
        ("Testing", "QA", "Software testing concepts and methodologies"),
        ("Selenium", "QA", "Browser automation framework for web testing"),
        ("Communication", "Soft Skills", "Effective verbal and written communication"),
        ("Problem Solving", "Soft Skills", "Analytical thinking and systematic problem approach")
    ]

    skill_map = {}
    for name, cat, desc in skills_data:
        s = Skill(skill_name=name, category=cat, description=desc)
        db.add(s)
        db.flush()
        skill_map[name] = s

    # 2. Careers
    careers_data = [
        ("Software Developer", "Build and maintain software applications across various domains", "IT", "4L - 12L"),
        ("Backend Developer", "Design server-side logic, APIs, and databases for web applications", "IT", "5L - 15L"),
        ("Frontend Developer", "Create user interfaces for web applications using HTML, CSS, JS", "IT", "4L - 12L"),
        ("Full Stack Developer", "Work across frontend and backend to deliver complete web solutions", "IT", "6L - 18L"),
        ("Data Analyst", "Collect, process, and analyze datasets to provide business insights", "Data", "4L - 12L"),
        ("Data Scientist", "Apply statistical and ML techniques to extract insights and build models", "Data", "6L - 20L"),
        ("Machine Learning Engineer", "Build and deploy machine learning models and AI systems at scale", "Data", "8L - 25L"),
        ("QA Engineer", "Ensure software quality through testing, automation, and defect management", "QA", "3L - 10L"),
        ("DevOps Engineer", "Streamline delivery pipelines and manage cloud infrastructure", "DevOps", "6L - 18L"),
        ("Database Administrator", "Design and maintain database systems ensuring performance and security", "Database", "4L - 12L"),
        ("Cybersecurity Analyst", "Protect systems from threats by monitoring and responding to incidents", "Security", "5L - 15L"),
        ("Business Analyst", "Bridge business needs and technical solutions through requirements analysis", "Business", "4L - 12L")
    ]

    career_map = {}
    for name, desc, ind, sal in careers_data:
        c = Career(career_name=name, description=desc, industry=ind, avg_salary_range=sal)
        db.add(c)
        db.flush()
        career_map[name] = c

    # 3. Career Skills
    career_skills_map = {
        "Software Developer": [("Java", 0.8, 7), ("Python", 0.7, 6), ("JavaScript", 0.6, 5), ("DSA", 0.8, 7), ("OOP", 0.8, 7), ("SQL", 0.7, 6), ("Git", 0.7, 6), ("Problem Solving", 0.7, 7)],
        "Backend Developer": [("Java", 0.9, 8), ("Python", 0.7, 7), ("SQL", 0.8, 7), ("OOP", 0.9, 8), ("DSA", 0.8, 7), ("REST API", 0.9, 8), ("Spring Boot", 0.8, 7), ("Git", 0.7, 6), ("PostgreSQL", 0.7, 6), ("Linux", 0.5, 5)],
        "Frontend Developer": [("JavaScript", 0.9, 8), ("React", 0.9, 8), ("HTML", 0.8, 7), ("CSS", 0.8, 7), ("Git", 0.7, 6), ("REST API", 0.6, 5), ("Problem Solving", 0.6, 6)],
        "Full Stack Developer": [("JavaScript", 0.8, 7), ("React", 0.8, 7), ("HTML", 0.7, 6), ("CSS", 0.7, 6), ("Java", 0.6, 6), ("Python", 0.6, 6), ("SQL", 0.7, 6), ("REST API", 0.8, 7), ("Git", 0.7, 6), ("OOP", 0.7, 6)],
        "Data Analyst": [("Python", 0.8, 7), ("SQL", 0.9, 8), ("Statistics", 0.8, 7), ("Data Analysis", 0.9, 8), ("PostgreSQL", 0.6, 6), ("Communication", 0.7, 7), ("Problem Solving", 0.7, 6)],
        "Data Scientist": [("Python", 0.9, 8), ("SQL", 0.8, 7), ("Statistics", 0.9, 8), ("Machine Learning", 0.9, 8), ("Data Analysis", 0.8, 7), ("Problem Solving", 0.8, 7), ("Communication", 0.6, 6)],
        "Machine Learning Engineer": [("Python", 0.9, 9), ("Machine Learning", 0.9, 9), ("Statistics", 0.8, 8), ("DSA", 0.7, 7), ("SQL", 0.6, 6), ("Docker", 0.6, 6), ("Git", 0.6, 6), ("Problem Solving", 0.7, 7)],
        "QA Engineer": [("Testing", 0.9, 8), ("Selenium", 0.8, 7), ("Java", 0.7, 6), ("Python", 0.6, 6), ("SQL", 0.6, 5), ("Communication", 0.7, 7), ("Problem Solving", 0.7, 6), ("Git", 0.5, 5)],
        "DevOps Engineer": [("Linux", 0.9, 8), ("Docker", 0.9, 8), ("AWS", 0.8, 7), ("Git", 0.8, 7), ("Python", 0.6, 6), ("REST API", 0.5, 5), ("Problem Solving", 0.6, 6)],
        "Database Administrator": [("SQL", 0.9, 9), ("PostgreSQL", 0.9, 8), ("Linux", 0.6, 5), ("Problem Solving", 0.6, 6), ("Python", 0.5, 5), ("Communication", 0.5, 5)],
        "Cybersecurity Analyst": [("Linux", 0.8, 8), ("Python", 0.7, 6), ("Problem Solving", 0.8, 8), ("Git", 0.5, 5), ("Communication", 0.6, 6), ("SQL", 0.5, 5)],
        "Business Analyst": [("SQL", 0.7, 6), ("Communication", 0.9, 8), ("Problem Solving", 0.8, 7), ("Data Analysis", 0.7, 6), ("Statistics", 0.6, 5)]
    }

    for cname, reqs in career_skills_map.items():
        car = career_map[cname]
        for sname, weight, level in reqs:
            sk = skill_map[sname]
            cs = CareerSkill(career_id=car.id, skill_id=sk.id, importance_weight=weight, required_level=level)
            db.add(cs)

    # 4. Users (Admin + Demo Student)
    admin_user = User(
        name="System Administrator",
        email="admin@career.com",
        password_hash=get_password_hash("admin123"),
        password_display="admin123",
        role="admin",
        education="M.Tech Computer Science (Faculty Admin)",
        onboarding_completed=True
    )
    db.add(admin_user)

    demo_user = User(
        name="Demo Student",
        email="demo@career.com",
        password_hash=get_password_hash("demo123"),
        password_display="demo123",
        role="student",
        education="B.E. Information Technology (BIT Sathy)",
        onboarding_completed=True
    )
    db.add(demo_user)
    db.flush()

    # User Skills
    user_skills_data = [
        ("Java", 7), ("Python", 6), ("SQL", 5), ("Git", 4),
        ("OOP", 6), ("DSA", 4), ("HTML", 7), ("CSS", 6),
        ("JavaScript", 5), ("Problem Solving", 6)
    ]
    for sname, lvl in user_skills_data:
        db.add(UserSkill(user_id=demo_user.id, skill_id=skill_map[sname].id, proficiency_level=lvl))

    # User Goal
    db.add(UserCareerGoal(user_id=demo_user.id, career_id=career_map["Software Developer"].id, is_active=True))

    # User Constraints
    deadline = datetime.date.today() + datetime.timedelta(days=365)
    db.add(UserConstraint(
        user_id=demo_user.id,
        learning_hours_per_week=15,
        career_deadline=deadline,
        preferred_learning_mode="Self-paced",
        career_preferences="Interested in backend and data roles"
    ))

    # User Interests
    for interest in ["Software Development", "Problem Solving", "Data"]:
        db.add(UserInterest(user_id=demo_user.id, interest=interest))

    # Transferable Skills
    transfers = [
        ("Software Developer", "Backend Developer", "Java", 0.9),
        ("Software Developer", "Data Analyst", "Python", 0.8),
        ("Software Developer", "Frontend Developer", "JavaScript", 0.9)
    ]
    for from_c, to_c, sk_name, weight in transfers:
        db.add(TransferableSkillMapping(
            from_career_id=career_map[from_c].id,
            to_career_id=career_map[to_c].id,
            skill_id=skill_map[sk_name].id,
            transfer_weight=weight
        ))

    db.commit()
    db.close()
    print("Database successfully seeded!")

if __name__ == "__main__":
    seed()
