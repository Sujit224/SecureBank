import os
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from app import database_models
from app.transactions.router import classify_transaction

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

try:
    # 1. Get first user
    user = db.query(database_models.User).first()
    if not user:
        print("No user found. Please create a user first.")
        exit(1)

    print(f"Seeding for user: {user.username}")

    # 2. Delete existing transactions & accounts
    db.query(database_models.Transaction).delete()
    db.query(database_models.Account).delete()
    db.commit()

    # 3. Create 3 new accounts
    accounts = []
    for i in range(3):
        acc = database_models.Account(
            user_id=user.user_id,
            account_number=f"ACC-{random.randint(100000, 999999)}",
            balance=100000.0, # Initial big deposit
            account_type=random.choice(["Savings", "Current", "Salary"])
        )
        db.add(acc)
        accounts.append(acc)
    
    db.commit()
    print([a.account_number for a in accounts])

    # 4. Generate 50 transactions per month for 3 months
    descriptions = {
        "Shopping": ["Purchased clothes from Amazon", "Bought shoes on Myntra", "Shopping at the Mall", "Flipkart order"],
        "Food & Dining": ["Dinner at Restaurant", "Swiggy order", "Zomato delivery", "Lunch with friends", "KFC weekend meal"],
        "Recreation": ["Movie theater", "Netflix subscription", "Spotify premium", "Steam game purchase"],
        "Transport": ["Uber ride", "Ola cab to work", "Flight ticket", "Petrol refill"],
        "Bills & Utilities": ["Electricity bill", "Water bill", "Wifi internet bill", "Mobile recharge"],
        "Daily Expense": ["Grocery from supermarket", "Milk and daily needs", "Vegetables from local mart"],
    }

    now = datetime.now(timezone.utc)
    # Months back: 0, 1, 2
    for month_offset in range(3):
        # target date is around `now - month_offset * 30 days`
        base_date = now - timedelta(days=month_offset * 30)
        
        for _ in range(50):
            # Pick a random day within that month (approx)
            random_day_offset = random.randint(0, 28)
            tx_date = base_date.replace(day=1) + timedelta(days=random_day_offset)
            
            acc = random.choice(accounts)
            
            # Decide if income or expense
            # Mostly expenses to populate the pie chart
            is_income = random.random() < 0.15 
            
            if is_income:
                amount = round(random.uniform(5000, 50000), 2)
                desc = random.choice(["Salary credited", "Freelance project payment", "Money received from friend"])
                tx_type = "RECEIVED"
                cat = "Income"
                other_acc = f"ACC-{random.randint(100000, 999999)}"
                
                # Update balance
                acc.balance += amount
                
                tx = database_models.Transaction(
                    sender_account=other_acc,
                    receiver_account=acc.account_number,
                    amount=amount,
                    transaction_type="RECEIVED",
                    description=desc,
                    status="SUCCESS",
                    timestamp=tx_date,
                    sender_balance=0.0,
                    receiver_balance=acc.balance,
                    category=cat
                )
            else:
                amount = round(random.uniform(100, 5000), 2)
                cat = random.choice(list(descriptions.keys()))
                desc = random.choice(descriptions[cat])
                tx_type = "TRANSFER"
                other_acc = f"MERCHANT-{random.randint(1000, 9999)}"
                
                acc.balance -= amount
                
                tx = database_models.Transaction(
                    sender_account=acc.account_number,
                    receiver_account=other_acc,
                    amount=amount,
                    transaction_type="TRANSFER",
                    description=desc,
                    status="SUCCESS",
                    timestamp=tx_date,
                    sender_balance=acc.balance,
                    receiver_balance=0.0,
                    category=cat
                )
            
            db.add(tx)
    
    db.commit()
    print("Database seeded successfully with 150 transactions across 3 months!")

except Exception as e:
    print("Error:", e)
finally:
    db.close()
