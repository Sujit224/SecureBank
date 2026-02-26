from langchain.tools import tool
from sqlalchemy import func, or_
from app.database import session as SessionLocal
from app.database_models import Transaction, User

# Tool 1: Get Balance
@tool
def get_current_balance(account_number: str) -> str:
    """
    Fetching the current balance.
    Args:
        account_number: The user's account number.
    """
    db = SessionLocal()
    print(f"\n[DEBUG] Getting current balance for: {account_number}")
    try:
        user = db.query(User).filter(User.account_number == account_number).first()

        if not user:
            return "Account not found"
        return f"Your current balance is ${user.balance:,.2f}"
    except Exception as e:
        return f"Error fetching balance: {str(e)}"
    finally:
        db.close()


# Tool 2: Get Transaction History
@tool
def get_transaction_history(
    account_number: str,
    start_date: str = None,
    end_date: str = None,
    limit: int = 60
) -> str:
    """
    Fetches raw transaction history.
    - start_date/end_date: 'YYYY-MM-DD' (Optional).
    - limit: max rows to return (default 60).
    
    CRITICAL: Use this for ALL questions about spending, bills, searching (e.g. "electricity"), 
    trends, or summaries. The AI will read the descriptions from this raw list.
    """
    db = SessionLocal()
    try:
        # 1. Clean the AI input to prevent case/space mismatches
        # Sometimes the LLM passes a raw JSON string as the first argument instead of using python kwargs
        try:
            import json
            import re
            if isinstance(account_number, str):
                if account_number.strip().startswith("{"):
                    parsed = json.loads(account_number)
                    account_number = parsed.get("account_number", account_number)
                    start_date = parsed.get("start_date", start_date)
                    end_date = parsed.get("end_date", end_date)
                    limit = parsed.get("limit", limit)
                elif "=" in account_number:
                    # Parses key="value", key="value" formats
                    kwargs_list = re.findall(r'(\w+)=[\'"]?([^\'",]+)[\'"]?', account_number)
                    kwargs_dict = {k: v for k, v in kwargs_list}
                    account_number = kwargs_dict.get("account_number", account_number)
                    start_date = kwargs_dict.get("start_date", start_date)
                    end_date = kwargs_dict.get("end_date", end_date)
                    if "limit" in kwargs_dict:
                        limit = int(kwargs_dict["limit"])
        except Exception as e:
            print(f"[DEBUG] String Parse error: {e}")
            pass
            
        target_acc = account_number.strip().lower()
        print(f"\n[DEBUG] AI Requesting History for: '{target_acc}' (Original: '{account_number}')")

        # 2. Base Query: Match Sender OR Receiver (Case-Insensitive & Whitespace Trimmed)
        query = db.query(Transaction).filter(
            or_(
                func.lower(func.trim(Transaction.sender_account)) == target_acc,
                func.lower(func.trim(Transaction.receiver_account)) == target_acc
            )
        )

        # 3. DATE FIX: Let SQL cast the DateTime to a pure Date for bulletproof string comparison
        if start_date:
            query = query.filter(func.date(Transaction.timestamp) >= start_date)
            print(f"[DEBUG] Applied Start Date: {start_date}")

        if end_date:
            query = query.filter(func.date(Transaction.timestamp) <= end_date)
            print(f"[DEBUG] Applied End Date: {end_date}")
        
        # 4. Fetch the Results
        results = query.order_by(Transaction.timestamp.desc()).limit(limit).all()

        print(f"[DEBUG] Database found {len(results)} rows.\n")

        if not results:
            return "No transactions found for the specified period."
        
        # 5. Format Output Safely
        output = []
        for tx in results:
            # Clean the DB sender for the Python comparison
            db_sender = tx.sender_account.strip().lower() if tx.sender_account else ""
            
            if db_sender == target_acc:
                direction = "Sent"
                party = tx.receiver_account
            else:
                direction = "Received"
                party = "SELF/ATM" if tx.transaction_type == "DEPOSIT" else tx.sender_account
            
            # Clean party string for the AI to read easily
            clean_party = party.strip() if party else "Unknown"
            
            output.append(
                f"{tx.timestamp.date()} | {direction} ${tx.amount} | Party: {clean_party} | "
                f"Type: {tx.transaction_type} | Desc: '{tx.description}'"
            )

        return "\n".join(output)
        
    except Exception as e:
        print(f"[DEBUG] SQL Error: {e}")
        return f"Error fetching transactions: {str(e)}"
    finally:
        db.close()