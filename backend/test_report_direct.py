from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.analytics.router import generate_analytics_report
from app import database_models
import os

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Tirumala123#")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "securebank")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
user = db.query(database_models.User).first()

try:
    print("Testing generate_analytics_report...")
    report = generate_analytics_report("profile", db, user)
    print(report)
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
