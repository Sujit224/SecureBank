import os
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from app import database_models

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

    # 3. Create 3 specific accounts matching user's screenshot
    acc_savings = database_models.Account(
        user_id=user.user_id,
        account_number="ACC-592653",
        balance=100000.0,  # Starting balance on March 1st
        account_type="Savings"
    )
    acc_current = database_models.Account(
        user_id=user.user_id,
        account_number="ACC-108257",
        balance=50000.0,   # Starting balance on March 1st
        account_type="Current"
    )
    acc_salary = database_models.Account(
        user_id=user.user_id,
        account_number="ACC-668295",
        balance=60000.0,   # Starting balance on March 1st
        account_type="Salary"
    )

    db.add(acc_savings)
    db.add(acc_current)
    db.add(acc_salary)
    db.commit()

    print(f"Created accounts: Savings={acc_savings.account_number}, Current={acc_current.account_number}, Salary={acc_salary.account_number}")

    # Predefined transaction categories & templates
    descriptions = {
        "Shopping": [
            ("Purchased clothes from Amazon", "Shopping"),
            ("Bought shoes on Myntra", "Shopping"),
            ("Shopping at the Mall", "Shopping"),
            ("Flipkart order for electronics", "Shopping"),
            ("Zara outlet shopping", "Shopping")
        ],
        "Food & Dining": [
            ("Dinner at Restaurant", "Food & Dining"),
            ("Swiggy order", "Food & Dining"),
            ("Zomato delivery", "Food & Dining"),
            ("Lunch with friends at Cafe", "Food & Dining"),
            ("KFC weekend meal", "Food & Dining"),
            ("Starbucks coffee", "Food & Dining")
        ],
        "Recreation": [
            ("Movie theater tickets", "Recreation"),
            ("Netflix subscription", "Recreation"),
            ("Spotify premium", "Recreation"),
            ("Steam game purchase", "Recreation"),
            ("Weekend gaming arcade", "Recreation")
        ],
        "Transport": [
            ("Uber ride to office", "Transport"),
            ("Ola cab ride", "Transport"),
            ("Petrol refill", "Transport"),
            ("Auto rickshaw ride", "Transport")
        ],
        "Bills & Utilities": [
            ("Electricity bill", "Bills & Utilities"),
            ("Water bill", "Bills & Utilities"),
            ("Wifi internet bill", "Bills & Utilities"),
            ("Mobile recharge", "Bills & Utilities")
        ],
        "Daily Expense": [
            ("Grocery from supermarket", "Daily Expense"),
            ("Milk and daily needs", "Daily Expense"),
            ("Vegetables from local mart", "Daily Expense"),
            ("Pharmacy medicine purchase", "Daily Expense")
        ]
    }

    # Set up running balances
    balances = {
        "ACC-592653": 100000.0,
        "ACC-108257": 50000.0,
        "ACC-668295": 60000.0
    }

    tx_list = []

    # Generate chronologically forward: March (3), April (4), May (5)
    for month in [3, 4, 5]:
        # Number of days in the month
        days_in_month = 31 if month in [3, 5] else 30
        
        # 1. Salary Credit on the 1st of the month
        salary_date = datetime(2026, month, 1, 9, 0, 0, tzinfo=timezone.utc)
        balances["ACC-668295"] += 85000.0
        tx_list.append(database_models.Transaction(
            sender_account="EMPLOYER-TECHCORP",
            receiver_account="ACC-668295",
            amount=85000.0,
            transaction_type="RECEIVED",
            description="Salary Credited from TechCorp",
            status="SUCCESS",
            timestamp=salary_date,
            sender_balance=0.0,
            receiver_balance=balances["ACC-668295"],
            category="Income"
        ))

        # 2. Monthly Savings Transfer on the 5th of the month
        transfer_date = datetime(2026, month, 5, 10, 0, 0, tzinfo=timezone.utc)
        balances["ACC-668295"] -= 25000.0
        balances["ACC-592653"] += 25000.0
        tx_list.append(database_models.Transaction(
            sender_account="ACC-668295",
            receiver_account="ACC-592653",
            amount=25000.0,
            transaction_type="TRANSFER",
            description="Monthly savings transfer",
            status="SUCCESS",
            timestamp=transfer_date,
            sender_balance=balances["ACC-668295"],
            receiver_balance=balances["ACC-592653"],
            category="Income"  # classified as Income for receiver, but router handles it dynamically.
        ))

        # 3. House Rent on the 5th of the month
        rent_date = datetime(2026, month, 5, 12, 0, 0, tzinfo=timezone.utc)
        balances["ACC-668295"] -= 15000.0
        tx_list.append(database_models.Transaction(
            sender_account="ACC-668295",
            receiver_account="LANDLORD-RENT",
            amount=15000.0,
            transaction_type="TRANSFER",
            description="House rent payment",
            status="SUCCESS",
            timestamp=rent_date,
            sender_balance=balances["ACC-668295"],
            receiver_balance=0.0,
            category="Bills & Utilities"
        ))

        # 4. Freelance Income on the 15th of the month
        freelance_date = datetime(2026, month, 15, 14, 30, 0, tzinfo=timezone.utc)
        balances["ACC-108257"] += 35000.0
        tx_list.append(database_models.Transaction(
            sender_account="CLIENT-DESIGN",
            receiver_account="ACC-108257",
            amount=35000.0,
            transaction_type="RECEIVED",
            description="Freelance design project payment",
            status="SUCCESS",
            timestamp=freelance_date,
            sender_balance=0.0,
            receiver_balance=balances["ACC-108257"],
            category="Income"
        ))

        # 5. Fixed Subscriptions
        # Netflix on the 15th
        netflix_date = datetime(2026, month, 15, 8, 0, 0, tzinfo=timezone.utc)
        balances["ACC-592653"] -= 649.0
        tx_list.append(database_models.Transaction(
            sender_account="ACC-592653",
            receiver_account="MERCHANT-NETFLIX",
            amount=649.0,
            transaction_type="TRANSFER",
            description="Netflix subscription",
            status="SUCCESS",
            timestamp=netflix_date,
            sender_balance=balances["ACC-592653"],
            receiver_balance=0.0,
            category="Recreation"
        ))
        
        # Spotify on the 20th
        spotify_date = datetime(2026, month, 20, 8, 0, 0, tzinfo=timezone.utc)
        balances["ACC-668295"] -= 119.0
        tx_list.append(database_models.Transaction(
            sender_account="ACC-668295",
            receiver_account="MERCHANT-SPOTIFY",
            amount=119.0,
            transaction_type="TRANSFER",
            description="Spotify premium",
            status="SUCCESS",
            timestamp=spotify_date,
            sender_balance=balances["ACC-668295"],
            receiver_balance=0.0,
            category="Recreation"
        ))

        # Wifi Internet on the 10th
        wifi_date = datetime(2026, month, 10, 11, 0, 0, tzinfo=timezone.utc)
        balances["ACC-668295"] -= 999.0
        tx_list.append(database_models.Transaction(
            sender_account="ACC-668295",
            receiver_account="MERCHANT-ACT",
            amount=999.0,
            transaction_type="TRANSFER",
            description="ACT Fibernet internet bill",
            status="SUCCESS",
            timestamp=wifi_date,
            sender_balance=balances["ACC-668295"],
            receiver_balance=0.0,
            category="Bills & Utilities"
        ))

        # Electricity on the 12th
        elec_date = datetime(2026, month, 12, 15, 0, 0, tzinfo=timezone.utc)
        balances["ACC-668295"] -= 2450.0
        tx_list.append(database_models.Transaction(
            sender_account="ACC-668295",
            receiver_account="MERCHANT-STATE-ELEC",
            amount=2450.0,
            transaction_type="TRANSFER",
            description="State Electricity Board payment",
            status="SUCCESS",
            timestamp=elec_date,
            sender_balance=balances["ACC-668295"],
            receiver_balance=0.0,
            category="Bills & Utilities"
        ))

        # 6. Generate other random natural transactions on random days
        random.seed(month * 42) # Deterministic but natural
        for day in range(2, days_in_month + 1):
            if day in [1, 5, 10, 12, 15, 20]:
                continue # Already handled main/fixed transactions

            # Each day, there's a chance of one or more expenses
            for acc_num in ["ACC-592653", "ACC-108257", "ACC-668295"]:
                # Salary account has more transactions, Savings has fewer, Current is moderate
                prob = 0.5 if acc_num == "ACC-668295" else (0.3 if acc_num == "ACC-108257" else 0.15)
                if random.random() < prob:
                    # Pick a category
                    cat = random.choice(list(descriptions.keys()))
                    if cat == "Bills & Utilities" and random.random() > 0.3:
                        # Utilities are usually fixed, pick something else
                        cat = random.choice(["Food & Dining", "Daily Expense", "Transport", "Shopping"])
                    
                    desc, category = random.choice(descriptions[cat])
                    
                    # Determine range of amount
                    if cat == "Shopping":
                        amount = round(random.uniform(800.0, 5000.0), 2)
                    elif cat == "Food & Dining":
                        amount = round(random.uniform(150.0, 1200.0), 2)
                    elif cat == "Transport":
                        amount = round(random.uniform(100.0, 600.0), 2)
                    elif cat == "Daily Expense":
                        amount = round(random.uniform(80.0, 1500.0), 2)
                    else:
                        amount = round(random.uniform(100.0, 2000.0), 2)
                    
                    # Deduct from running balance
                    balances[acc_num] -= amount
                    
                    hour = random.randint(8, 22)
                    minute = random.randint(0, 59)
                    tx_time = datetime(2026, month, day, hour, minute, 0, tzinfo=timezone.utc)
                    
                    other_party = f"MERCHANT-{random.randint(1000, 9999)}"
                    
                    tx_list.append(database_models.Transaction(
                        sender_account=acc_num,
                        receiver_account=other_party,
                        amount=amount,
                        transaction_type="TRANSFER",
                        description=desc,
                        status="SUCCESS",
                        timestamp=tx_time,
                        sender_balance=balances[acc_num],
                        receiver_balance=0.0,
                        category=category
                    ))

    # Save transactions
    for tx in tx_list:
        db.add(tx)

    # 7. Update balances in the Account tables to exactly match the final running balances
    acc_savings.balance = round(balances["ACC-592653"], 2)
    acc_current.balance = round(balances["ACC-108257"], 2)
    acc_salary.balance = round(balances["ACC-668295"], 2)

    db.commit()
    
    print("\nDatabase seeded successfully!")
    print(f"Final Balances:")
    print(f"Savings Account (ACC-592653): Rs.{acc_savings.balance}")
    print(f"Current Account (ACC-108257): Rs.{acc_current.balance}")
    print(f"Salary Account (ACC-668295): Rs.{acc_salary.balance}")
    print(f"Total Transactions Created: {len(tx_list)}")

except Exception as e:
    print("Error:", e)
    db.rollback()
finally:
    db.close()
