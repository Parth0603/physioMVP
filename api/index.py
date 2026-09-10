import sys
import os
import shutil

# Ensure backend package is on Python sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

# Prepare writable SQLite database in /tmp for Vercel serverless functions
tmp_db = "/tmp/physiosmart.db"
if not os.path.exists(tmp_db):
    seed_candidates = [
        os.path.join(backend_dir, "app", "db", "seed.db"),
        os.path.join(os.path.dirname(__file__), "..", "backend", "app", "db", "seed.db"),
        os.path.join(os.path.dirname(__file__), "..", "physiosmart.db"),
    ]
    for seed in seed_candidates:
        seed_abs = os.path.abspath(seed)
        if os.path.exists(seed_abs):
            try:
                shutil.copyfile(seed_abs, tmp_db)
                print(f"[VERCEL] Copied seed db from {seed_abs} to {tmp_db}")
                break
            except Exception as e:
                print(f"[VERCEL] Error copying {seed_abs}: {e}")

# Explicitly set DATABASE_URL for Vercel execution environment
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db}"

from app.main import app
from app.db.session import engine, Base, SessionLocal

# Ensure tables and demo student account exist
try:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    from app.models.user import User
    student_user = db.query(User).filter(User.email == "student@physiosmart.edu").first()
    if not student_user:
        print("[VERCEL] User missing, running seed script...")
        from scripts.seed_data import seed_database
        seed_database()
    db.close()
except Exception as err:
    print(f"[VERCEL] Database initialization warning: {err}")

