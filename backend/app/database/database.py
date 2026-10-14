import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Fallback to SQLite if DATABASE_URL is not set
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./career_portal.db")

# SQLite needs connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        try:
            from sqlalchemy import text
            with engine.connect() as conn:
                res = conn.execute(text("PRAGMA table_info(users)"))
                cols = [r[1] for r in res.fetchall()]
                if "role" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student'"))
                if "password_display" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_display VARCHAR"))
                conn.commit()
        except Exception:
            pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

