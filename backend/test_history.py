import sys
import os

from app.database import session as SessionLocal
from app.database_models import Transaction, User
from app.ai.tools import get_transaction_history

db = SessionLocal()
try:
    user = db.query(User).first()
    if not user:
        print("No users found")
        sys.exit(0)
    
    account_number = user.account_number
    
    print("\n--- TEST: 2026-02-25 ---")
    res = get_transaction_history.invoke({
        "account_number": account_number,
        "start_date": "2026-02-25",
        "end_date": "2026-02-25"
    })
    print(res)

except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
