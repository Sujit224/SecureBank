from langchain.tools import tool
from sqlalchemy import func, or_
from app.database import session as SessionLocal
from app.database_models import Transaction, User
from datetime import datetime,timedelta,timezone
import re
import json

# Tool 1: Get Balance
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
        user = db.query(User).filter(User.account_number == account_number).first()

        if not user:
            return json.dumps({
                "status":"error",
                "error": "Account not found"
            })

        return json.dumps({
            "status":"success",
            "account_number": account_number,
            "balance": float(user.balance),
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

        print("✅ PARSED ACCOUNT:", account_number)

        target_acc = clean(account_number)

        # -----------------------------
        # Step 1: Build base query (NO account filter here)
        # -----------------------------
        query = db.query(Transaction)

        # -----------------------------
        # Step 2: Apply DATE filtering (SAFE)
        # -----------------------------
        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            query = query.filter(Transaction.timestamp >= start_dt)

        if end_date:
            end_dt = (
                datetime.strptime(end_date, "%Y-%m-%d")
                .replace(tzinfo=timezone.utc)
                + timedelta(days=1)
            )
            query = query.filter(Transaction.timestamp < end_dt)

        # -----------------------------
        # Step 3: Fetch results
        # -----------------------------
        results = query.order_by(Transaction.timestamp.desc()).all()

        # -----------------------------
        # Step 4: Filter by account in Python (RELIABLE)
        # -----------------------------
        filtered_results = []

        for tx in results:
            sender = clean(tx.sender_account)
            receiver = clean(tx.receiver_account)

            if sender == target_acc or receiver == target_acc:
                filtered_results.append(tx)

        filtered_results = filtered_results[:limit]

        # -----------------------------
        # Step 5: Handle empty results
        # -----------------------------
        if not filtered_results:
            print("FINAL DEBUG PRINTS..................")
            print("RESULTS:", len(results))
            print("FILTERED:", len(filtered_results))

            return json.dumps({
                "status": "success",
                "count": 0,
                "transactions": []
            })

        # -----------------------------
        # Step 6: Format response
        # -----------------------------
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

        # -----------------------------
        # Step 7: Return JSON
        # -----------------------------
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