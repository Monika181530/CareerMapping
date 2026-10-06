# 🎯 CareerPath — Hyper-Personalized Career Path Mapping Portal with Automated Industry Skill-Gap Analysis

A full-stack academic web portal designed to help students discover, analyze, monitor, and recover their career trajectories using explainable rule-based algorithms.

---

## 🌟 Key Features

- **Beginner Registration & Secure Authentication**: JWT Bearer token authentication with PostgreSQL storage and zero pre-selected skills for new accounts.
- **6-Step Interactive Onboarding**: Step-by-step profile setup collecting education, custom skills, proficiency levels (1–10), interests, and weekly time constraints.
- **Automated Industry Skill-Gap Analysis**: Weighted match percentage calculation and gap classification (`Strong`, `Needs Improvement`, `Major Gap`, `Missing`).
- **Dynamic Learning Roadmap**: Phase-by-phase timeline estimating learning weeks per skill based on student weekly available hours.
- **Real-Time Career Monitoring**: Dynamic feasibility tracker evaluating target deadlines against required learning weeks (`Feasible`, `Needs Review`, `Not Feasible`).
- **Explainable Career Recovery Engine**: Pivoting engine ranking alternative careers by composite **Recovery Score** to maximize skill reuse.
- **Side-by-Side Career Comparison**: Interactive visual and metric comparisons across roles.
- **Skill Reuse Analysis**: Detailed matrix visualizing transferable vs. missing skills across target roles.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Recharts, Lucide Icons, Vite
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2
- **Database**: PostgreSQL / SQLite (fallback)
- **Authentication**: `passlib` (bcrypt) + `python-jose` (JWT Bearer Tokens)

---

## 🚀 Quick Start Guide

### 1. Start Backend Server (FastAPI)

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

> **API Base URL**: `http://localhost:8000`  
> **Interactive Docs**: `http://localhost:8000/docs`

### 2. Start Frontend Application (React)

```bash
cd frontend
npm install
npm run dev -- --port 3000
```

> **Web Portal URL**: `http://localhost:3000`

---

## 📁 Repository Structure

```
career-portal/
├── backend/
│   ├── app/
│   │   ├── algorithms/      # Skill-gap, recovery, and roadmap engines
│   │   ├── database/        # SQLAlchemy database connection setup
│   │   ├── models/          # ORM models (User, Skill, Goal, Constraints, etc.)
│   │   ├── routers/         # REST API routers (auth, profile, skills, careers, etc.)
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   └── utils/           # Security & JWT helpers
│   ├── main.py              # FastAPI entry point
│   └── requirements.txt
├── database/
│   ├── schema.sql           # PostgreSQL table definitions
│   └── seed.sql             # Skills, careers, and demo data seed script
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components & charts
    │   ├── context/         # AuthContext state management
    │   ├── layouts/         # DashboardLayout shell
    │   ├── pages/           # 19 SPA pages (Onboarding, Analysis, Roadmap, etc.)
    │   └── services/        # Axios API client module
    └── package.json
```
