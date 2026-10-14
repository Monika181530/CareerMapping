from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base, init_db
from app.routers import auth, profile, skills, careers, skill_gap, roadmap, recovery, monitoring, admin

# Create DB tables and ensure schema
init_db()

app = FastAPI(title="Career Path Mapping Portal API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(skills.router)
app.include_router(careers.router)
app.include_router(skill_gap.router)
app.include_router(roadmap.router)
app.include_router(recovery.router)
app.include_router(monitoring.router)
app.include_router(admin.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to Career Path Mapping Portal API"}
