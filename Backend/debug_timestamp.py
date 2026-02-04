import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import database_models
from datetime import datetime

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD") # Note: verify if quote_plus is needed here or if generic driver handles it. The app uses it.
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# App logic uses quote_plus for password, so I should too effectively or just use the connection string from app/database.py principle
from urllib.parse import quote_plus
encoded_password = quote_plus(DB_PASSWORD)

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_timestamps():
    db = SessionLocal()
    try:
        # Get the latest transaction
        txn = db.query(database_models.Transaction).order_by(database_models.Transaction.timestamp.desc()).first()
        if txn:
            print(f"ID: {txn.id}")
            print(f"Raw Timestamp from DB: {txn.timestamp}")
            print(f"Type: {type(txn.timestamp)}")
            print(f"Tzinfo: {txn.timestamp.tzinfo}")
            print(f"Now (UTC): {datetime.utcnow()}")
        else:
            print("No transactions found.")
    finally:
        db.close()

if __name__ == "__main__":
    check_timestamps()
