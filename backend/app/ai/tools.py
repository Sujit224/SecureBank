from langchain.tools import tool
from sqlalchemy import func, or_
from app.database import session as SessionLocal
from app.database_models import Transaction, User, Account
from datetime import datetime,timedelta,timezone
import re
import json


IST = timezone(timedelta(hours=5, minutes=30))


@tool
def get_current_balance(account_number: str) -> str:
    """
    Fetch the current account balance.

    IMPORTANT:
    Returns structured JSON.
    The AI must not invent financial data.
    """

    db = SessionLocal()

    #print(f"\n[DEBUG] Getting current balance for: {account_number}")

    try:
        account = db.query(Account).filter(Account.account_number == account_number).first()

        if not account:
            return json.dumps({
                "status":"error",
                "error": "Account not found"
            })

        return json.dumps({
            "status":"success",
            "account_number": account_number,
            "balance": float(account.balance),
            "currency": "INR(₹) Rupees"
        })

    except Exception as e:
        return json.dumps({
            "status":"error",
            "message":str(e)
        })

    finally:
        db.close()


def clean(val: str) -> str:
    if not val:
        return ""
    return "".join(val.split()).lower()

@tool
def get_transaction_history(
    account_number: str,
    start_date: str = None,
    end_date: str = None,
    limit: int = 60
) -> str:
    """
    Fetch transaction history for an account.

    IMPORTANT:
    - Returns structured JSON
    - The AI must only analyze returned transactions
    - The AI must never fabricate transactions
    """
    db = SessionLocal()

    try:

        
        if isinstance(account_number, str) and "account_number" in account_number:
            match = re.search(r'account_number\s*=\s*["\']?([^,"\']+)', account_number)
            if match:
                account_number = match.group(1)

        print("PARSED ACCOUNT:", account_number)

        target_acc = clean(account_number)


        query = db.query(Transaction)

       
        ist_offset = timedelta(hours=5, minutes=30)

        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d") - ist_offset
            query = query.filter(Transaction.timestamp >= start_dt)

        if end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1) - ist_offset
            query = query.filter(Transaction.timestamp < end_dt)


        # Database-level filtering to prevent Denial of Service (loading all history into RAM)
        query = query.filter(
            or_(
                func.lower(func.replace(Transaction.sender_account, ' ', '')) == target_acc,
                func.lower(func.replace(Transaction.receiver_account, ' ', '')) == target_acc
            )
        )

        results = query.order_by(Transaction.timestamp.desc()).limit(limit).all()

        filtered_results = results # Already filtered by database

        if not filtered_results:
            return json.dumps({
                "status": "success",
                "count": 0,
                "transactions": []
            })

        transactions = []

        for tx in filtered_results:
            sender = clean(tx.sender_account)

            if sender == target_acc:
                direction = "sent"
                party = tx.receiver_account
            else:
                direction = "received"
                party = "SELF/ATM" if tx.transaction_type == "DEPOSIT" else tx.sender_account

            transactions.append({
                "date": str(tx.timestamp.date()),
                "amount": float(tx.amount),
                "direction": direction,
                "party": party.strip() if party else "Unknown",
                "transaction_type": tx.transaction_type,
                "description": tx.description
            })


        return json.dumps({
            "status": "success",
            "count": len(transactions),
            "transactions": transactions
        })

        print("FINAL DEBUG PRINTS..................")
        print(len(results))
        print(len(filtered_results))


    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": str(e)
        })

        
    finally:
        db.close()


@tool
def get_profile_details(account_number: str) -> str:
    """
    Fetch the user profile and demographic details associated with an account.
    
    IMPORTANT:
    - Returns structured JSON containing name, email, mobile, age, profession, etc.
    - Use this when the user asks about their own profile information, age, contact info, etc.
    """
    db = SessionLocal()
    try:
        if isinstance(account_number, str) and "account_number" in account_number:
            match = re.search(r'account_number\s*=\s*["\']?([^,"\']+)', account_number)
            if match:
                account_number = match.group(1)
                
        target_acc = clean(account_number)
        
        # Try exact match first
        account = db.query(Account).filter(Account.account_number == account_number).first()
        
        # Fallback to cleaned match
        if not account:
            account = db.query(Account).filter(func.lower(func.replace(Account.account_number, ' ', '')) == target_acc).first()
            
        if not account:
            return json.dumps({"status": "error", "error": "Account not found"})
            
        user = account.owner
        if not user:
            return json.dumps({"status": "error", "error": "User profile not linked to this account"})
            
        return json.dumps({
            "status": "success",
            "username": user.username,
            "email": user.email,
            "mobile_number": user.mobile_number,
            "age": user.age,
            "profession": user.profession,
            "income_range": user.income_range,
            "gender": user.gender,
            "marital_status": user.marital_status,
            "account_type": account.account_type,
            "member_since": str(user.created_at.date()) if user.created_at else None
        })
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": str(e)
        })
    finally:
        db.close()
