-- ============================================================
-- CAREER PORTAL - COMPLETE SEED DATA
-- ============================================================

-- Clear existing data (in dependency order)
DELETE FROM career_recovery;
DELETE FROM roadmap_items;
DELETE FROM roadmaps;
DELETE FROM career_monitoring;
DELETE FROM user_career_goals;
DELETE FROM user_constraints;
DELETE FROM user_interests;
DELETE FROM user_skills;
DELETE FROM career_skills;
DELETE FROM transferable_skill_mappings;
DELETE FROM users;
DELETE FROM careers;
DELETE FROM skills;

-- Reset sequences
ALTER SEQUENCE skills_id_seq RESTART WITH 1;
ALTER SEQUENCE careers_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- ============================================================
-- SKILLS (26 skills)
-- ============================================================
INSERT INTO skills (skill_name, category, description) VALUES
(''Java'', ''Programming'', ''Object-oriented language for enterprise development''),
(''Python'', ''Programming'', ''High-level language for data science, AI, web backends''),
(''C'', ''Programming'', ''Low-level systems programming language''),
(''C++'', ''Programming'', ''Extension of C with object-oriented features''),
(''JavaScript'', ''Web'', ''Core language for web frontend and Node.js backend''),
(''React'', ''Web'', ''Popular JavaScript library for user interfaces''),
(''HTML'', ''Web'', ''Markup language for structuring web content''),
(''CSS'', ''Web'', ''Stylesheet language for designing web pages''),
(''SQL'', ''Database'', ''Structured query language for relational databases''),
(''PostgreSQL'', ''Database'', ''Advanced open-source relational database system''),
(''DSA'', ''Programming'', ''Data Structures and Algorithms - core CS fundamentals''),
(''OOP'', ''Programming'', ''Object-Oriented Programming concepts and design patterns''),
(''Git'', ''DevOps'', ''Distributed version control system''),
(''REST API'', ''Web'', ''Architectural style for networked application APIs''),
(''Spring Boot'', ''Web'', ''Java framework for microservices and web apps''),
(''FastAPI'', ''Web'', ''Modern Python web framework for building APIs''),
(''Linux'', ''DevOps'', ''Open-source OS widely used in servers''),
(''Docker'', ''DevOps'', ''Containerization platform for packaging applications''),
(''AWS'', ''DevOps'', ''Amazon Web Services cloud computing platform''),
(''Statistics'', ''Data Science'', ''Mathematical analysis of data for inference''),
(''Machine Learning'', ''Data Science'', ''Algorithms that learn patterns from data''),
(''Data Analysis'', ''Data Science'', ''Process of inspecting and modeling data''),
(''Testing'', ''QA'', ''Software testing concepts and methodologies''),
(''Selenium'', ''QA'', ''Browser automation framework for web testing''),
(''Communication'', ''Soft Skills'', ''Effective verbal and written communication''),
(''Problem Solving'', ''Soft Skills'', ''Analytical thinking and systematic problem approach'');

-- ============================================================
-- CAREERS (12 careers)
-- ============================================================
INSERT INTO careers (career_name, description, industry, avg_salary_range) VALUES
(''Software Developer'', ''Build and maintain software applications across various domains'', ''IT'', ''4L - 12L''),
(''Backend Developer'', ''Design server-side logic, APIs, and databases for web applications'', ''IT'', ''5L - 15L''),
(''Frontend Developer'', ''Create user interfaces for web applications using HTML, CSS, JS'', ''IT'', ''4L - 12L''),
(''Full Stack Developer'', ''Work across frontend and backend to deliver complete web solutions'', ''IT'', ''6L - 18L''),
(''Data Analyst'', ''Collect, process, and analyze datasets to provide business insights'', ''Data'', ''4L - 12L''),
(''Data Scientist'', ''Apply statistical and ML techniques to extract insights and build models'', ''Data'', ''6L - 20L''),
(''Machine Learning Engineer'', ''Build and deploy machine learning models and AI systems at scale'', ''Data'', ''8L - 25L''),
(''QA Engineer'', ''Ensure software quality through testing, automation, and defect management'', ''QA'', ''3L - 10L''),
(''DevOps Engineer'', ''Streamline delivery pipelines and manage cloud infrastructure'', ''DevOps'', ''6L - 18L''),
(''Database Administrator'', ''Design and maintain database systems ensuring performance and security'', ''Database'', ''4L - 12L''),
(''Cybersecurity Analyst'', ''Protect systems from threats by monitoring and responding to incidents'', ''Security'', ''5L - 15L''),
(''Business Analyst'', ''Bridge business needs and technical solutions through requirements analysis'', ''Business'', ''4L - 12L'');

-- ============================================================
-- CAREER SKILLS MAPPINGS (ALL 12 CAREERS)
-- ============================================================

-- SOFTWARE DEVELOPER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Java'',0.8,7),(''Python'',0.7,6),(''JavaScript'',0.6,5),(''DSA'',0.8,7),(''OOP'',0.8,7),(''SQL'',0.7,6),(''Git'',0.7,6),(''Problem Solving'',0.7,7)) AS vals(sn,w,l)
WHERE c.career_name=''Software Developer'' AND s.skill_name=vals.sn;

-- BACKEND DEVELOPER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Java'',0.9,8),(''Python'',0.7,7),(''SQL'',0.8,7),(''OOP'',0.9,8),(''DSA'',0.8,7),(''REST API'',0.9,8),(''Spring Boot'',0.8,7),(''Git'',0.7,6),(''PostgreSQL'',0.7,6),(''Linux'',0.5,5)) AS vals(sn,w,l)
WHERE c.career_name=''Backend Developer'' AND s.skill_name=vals.sn;

-- FRONTEND DEVELOPER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''JavaScript'',0.9,8),(''React'',0.9,8),(''HTML'',0.8,7),(''CSS'',0.8,7),(''Git'',0.7,6),(''REST API'',0.6,5),(''Problem Solving'',0.6,6)) AS vals(sn,w,l)
WHERE c.career_name=''Frontend Developer'' AND s.skill_name=vals.sn;

-- FULL STACK DEVELOPER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''JavaScript'',0.8,7),(''React'',0.8,7),(''HTML'',0.7,6),(''CSS'',0.7,6),(''Java'',0.6,6),(''Python'',0.6,6),(''SQL'',0.7,6),(''REST API'',0.8,7),(''Git'',0.7,6),(''OOP'',0.7,6)) AS vals(sn,w,l)
WHERE c.career_name=''Full Stack Developer'' AND s.skill_name=vals.sn;

-- DATA ANALYST
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Python'',0.8,7),(''SQL'',0.9,8),(''Statistics'',0.8,7),(''Data Analysis'',0.9,8),(''PostgreSQL'',0.6,6),(''Communication'',0.7,7),(''Problem Solving'',0.7,6)) AS vals(sn,w,l)
WHERE c.career_name=''Data Analyst'' AND s.skill_name=vals.sn;

-- DATA SCIENTIST
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Python'',0.9,8),(''SQL'',0.8,7),(''Statistics'',0.9,8),(''Machine Learning'',0.9,8),(''Data Analysis'',0.8,7),(''Problem Solving'',0.8,7),(''Communication'',0.6,6)) AS vals(sn,w,l)
WHERE c.career_name=''Data Scientist'' AND s.skill_name=vals.sn;

-- MACHINE LEARNING ENGINEER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Python'',0.9,9),(''Machine Learning'',0.9,9),(''Statistics'',0.8,8),(''DSA'',0.7,7),(''SQL'',0.6,6),(''Docker'',0.6,6),(''Git'',0.6,6),(''Problem Solving'',0.7,7)) AS vals(sn,w,l)
WHERE c.career_name=''Machine Learning Engineer'' AND s.skill_name=vals.sn;

-- QA ENGINEER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Testing'',0.9,8),(''Selenium'',0.8,7),(''Java'',0.7,6),(''Python'',0.6,6),(''SQL'',0.6,5),(''Communication'',0.7,7),(''Problem Solving'',0.7,6),(''Git'',0.5,5)) AS vals(sn,w,l)
WHERE c.career_name=''QA Engineer'' AND s.skill_name=vals.sn;

-- DEVOPS ENGINEER
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Linux'',0.9,8),(''Docker'',0.9,8),(''AWS'',0.8,7),(''Git'',0.8,7),(''Python'',0.6,6),(''REST API'',0.5,5),(''Problem Solving'',0.6,6)) AS vals(sn,w,l)
WHERE c.career_name=''DevOps Engineer'' AND s.skill_name=vals.sn;

-- DATABASE ADMINISTRATOR
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''SQL'',0.9,9),(''PostgreSQL'',0.9,8),(''Linux'',0.6,5),(''Problem Solving'',0.6,6),(''Python'',0.5,5),(''Communication'',0.5,5)) AS vals(sn,w,l)
WHERE c.career_name=''Database Administrator'' AND s.skill_name=vals.sn;

-- CYBERSECURITY ANALYST
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''Linux'',0.8,8),(''Python'',0.7,6),(''Problem Solving'',0.8,8),(''Git'',0.5,5),(''Communication'',0.6,6),(''SQL'',0.5,5)) AS vals(sn,w,l)
WHERE c.career_name=''Cybersecurity Analyst'' AND s.skill_name=vals.sn;

-- BUSINESS ANALYST
INSERT INTO career_skills (career_id, skill_id, importance_weight, required_level)
SELECT c.id, s.id, vals.w, vals.l FROM careers c, skills s,
(VALUES (''SQL'',0.7,6),(''Communication'',0.9,8),(''Problem Solving'',0.8,7),(''Data Analysis'',0.7,6),(''Statistics'',0.6,5)) AS vals(sn,w,l)
WHERE c.career_name=''Business Analyst'' AND s.skill_name=vals.sn;

-- ============================================================
-- DEMO USER (password: demo123)
-- ============================================================
INSERT INTO users (name, email, password_hash, education)
VALUES (''Demo Student'', ''demo@career.com'', ''$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQMNEKrNDJKW'', ''B.E. Information Technology'');

INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 7 FROM skills WHERE skill_name=''Java'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 6 FROM skills WHERE skill_name=''Python'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 5 FROM skills WHERE skill_name=''SQL'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 4 FROM skills WHERE skill_name=''Git'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 6 FROM skills WHERE skill_name=''OOP'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 4 FROM skills WHERE skill_name=''DSA'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 7 FROM skills WHERE skill_name=''HTML'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 6 FROM skills WHERE skill_name=''CSS'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 5 FROM skills WHERE skill_name=''JavaScript'';
INSERT INTO user_skills (user_id, skill_id, proficiency_level) SELECT 1, id, 6 FROM skills WHERE skill_name=''Problem Solving'';

INSERT INTO user_career_goals (user_id, career_id, is_active)
SELECT 1, id, true FROM careers WHERE career_name=''Software Developer'';

INSERT INTO user_constraints (user_id, learning_hours_per_week, career_deadline, preferred_learning_mode, career_preferences)
VALUES (1, 15, CURRENT_DATE + INTERVAL ''365 days'', ''Self-paced'', ''Interested in backend and data roles'');

INSERT INTO user_interests (user_id, interest)
VALUES (1, ''Software Development''), (1, ''Problem Solving''), (1, ''Data'');

-- ============================================================
-- TRANSFERABLE SKILL MAPPINGS
-- ============================================================
INSERT INTO transferable_skill_mappings (from_career_id, to_career_id, skill_id, transfer_weight)
SELECT f.id, t.id, s.id, 0.9 FROM careers f, careers t, skills s
WHERE f.career_name=''Software Developer'' AND t.career_name=''Backend Developer'' AND s.skill_name=''Java'';

INSERT INTO transferable_skill_mappings (from_career_id, to_career_id, skill_id, transfer_weight)
SELECT f.id, t.id, s.id, 0.8 FROM careers f, careers t, skills s
WHERE f.career_name=''Software Developer'' AND t.career_name=''Data Analyst'' AND s.skill_name=''Python'';

INSERT INTO transferable_skill_mappings (from_career_id, to_career_id, skill_id, transfer_weight)
SELECT f.id, t.id, s.id, 0.9 FROM careers f, careers t, skills s
WHERE f.career_name=''Software Developer'' AND t.career_name=''Frontend Developer'' AND s.skill_name=''JavaScript'';
