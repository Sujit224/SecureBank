import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

def classify_transaction(description, display_type):
    desc = description.lower() if description else ""
    
    if display_type in ["DEPOSIT", "RECEIVED"]:
        return "Income"
    
    if any(keyword in desc for keyword in ["amazon", "flipkart", "myntra", "shopping", "clothes", "mall", "store"]):
        return "Shopping"
    if any(keyword in desc for keyword in ["zomato", "swiggy", "food", "lunch", "dinner", "breakfast", "cafe", "restaurant", "mcdonalds", "dominos", "kfc"]):
        return "Food & Dining"
    if any(keyword in desc for keyword in ["movie", "recreation", "netflix", "spotify", "game", "steam", "psn", "theater"]):
        return "Recreation"
    if any(keyword in desc for keyword in ["uber", "ola", "rapido", "transport", "bus", "train", "flight", "ticket", "petrol", "fuel"]):
        return "Transport"
    if any(keyword in desc for keyword in ["electricity", "water", "rent", "emi", "loan", "bill", "recharge", "wifi", "internet"]):
        return "Bills & Utilities"
    if any(keyword in desc for keyword in ["grocery", "milk", "vegetables", "daily", "supermarket", "mart"]):
        return "Daily Expense"
    
    return "Others"


try:
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN category VARCHAR(50) DEFAULT 'Others';"))
            print("Added category column.")
        except Exception as e:
            print("Category column might already exist:", e)
        
        # Now update existing categories
        result = conn.execute(text("SELECT id, description, type, sender_account FROM transactions;"))
        transactions = result.fetchall()
        
        for tx in transactions:
            tx_id, desc, tx_type, sender = tx
            
            # Simple heuristic since we don't have perfect context per row here
            display_type = "SENT"
            if tx_type == "DEPOSIT": display_type = "DEPOSIT"
            # we just guess "SENT" or "RECEIVED" for transfers, usually if sender is not SELF.
            # to be simple, if type is not DEPOSIT, we just check description
            
            cat = classify_transaction(desc, display_type)
            conn.execute(text("UPDATE transactions SET category = :cat WHERE id = :id"), {"cat": cat, "id": tx_id})
        
        conn.commit()
        print("Categories updated.")
except Exception as e:
    print("Error:", e)
