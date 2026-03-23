from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth.dependencies import get_current_user, get_db
from sqlalchemy.orm import Session
from app.database_models import User, Account
from app.ai.agent import ask_agent

router = APIRouter(prefix="/ai",tags= ["AI Chatbot"])

class ChatRequest(BaseModel):
    query: str
    account_number: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    requires_account_selection: bool = False

@router.post("/")
def chat_with_bank_agent(
    request: ChatRequest,
    current_user : User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    user_account_number = request.account_number or "NONE"
    
    # Get all accounts for the user safely
    accounts = db.query(Account).filter(Account.user_id == current_user.user_id).all()
    user_accounts = [acc.account_number for acc in accounts]
        
    ai_answer = ask_agent(request.query, user_account_number, user_accounts)
    
    requires_selection = False
    if ai_answer.startswith("REQUIRE_ACCOUNT:"):
        ai_answer = ai_answer.replace("REQUIRE_ACCOUNT:", "").strip()
        requires_selection = True
    
    return {
        "response": ai_answer,
        "requires_account_selection": requires_selection
    }
