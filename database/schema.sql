CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    education VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR UNIQUE,
    category VARCHAR,
    description TEXT
);

CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    skill_id INT REFERENCES skills(id),
    proficiency_level INT CHECK (proficiency_level >= 1 AND proficiency_level <= 10),
    status VARCHAR DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE careers (
    id SERIAL PRIMARY KEY,
    career_name VARCHAR UNIQUE,
    description TEXT,
    industry VARCHAR,
    avg_salary_range VARCHAR
);

CREATE TABLE career_skills (
    id SERIAL PRIMARY KEY,
    career_id INT REFERENCES careers(id),
    skill_id INT REFERENCES skills(id),
    importance_weight DECIMAL CHECK (importance_weight >= 0 AND importance_weight <= 1),
    required_level INT CHECK (required_level >= 1 AND required_level <= 10)
);

CREATE TABLE user_career_goals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    career_id INT REFERENCES careers(id),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_interests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    interest VARCHAR
);

CREATE TABLE user_constraints (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    learning_hours_per_week INT,
    career_deadline DATE,
    preferred_learning_mode VARCHAR,
    career_preferences TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    career_id INT REFERENCES careers(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_phases INT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE roadmap_items (
    id SERIAL PRIMARY KEY,
    roadmap_id INT REFERENCES roadmaps(id),
    skill_id INT REFERENCES skills(id),
    phase_number INT,
    priority VARCHAR,
    current_level INT,
    required_level INT,
    estimated_weeks INT,
    status VARCHAR DEFAULT 'pending'
);

CREATE TABLE career_monitoring (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    career_id INT REFERENCES careers(id),
    skill_match_pct DECIMAL,
    feasibility_status VARCHAR,
    monitored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_recovery (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    original_career_id INT REFERENCES careers(id),
    alternative_career_id INT REFERENCES careers(id),
    skill_reuse_score DECIMAL,
    additional_learning_effort INT,
    recovery_score DECIMAL,
    estimated_months INT,
    is_recommended BOOLEAN,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transferable_skill_mappings (
    id SERIAL PRIMARY KEY,
    from_career_id INT REFERENCES careers(id),
    to_career_id INT REFERENCES careers(id),
    skill_id INT REFERENCES skills(id),
    transfer_weight DECIMAL
);
