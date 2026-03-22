from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel
from app.auth.dependencies import get_current_user
from app.database_models import User
from app.ai.agent import ask_agent

router = APIRouter(prefix="/ai",tags= ["AI Chatbot"])

class ChatRequest(BaseModel):
    query:str

class ChatResponse(BaseModel):
    response:str


@router.post("/")
def chat_with_bank_agent(
    request: ChatRequest,
    current_user : User = Depends(get_current_user)
):
    
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    # Get the first account number for the AI agent
    user_account_number = current_user.accounts[0].account_number if current_user.accounts else ""
    ai_answer = ask_agent(request.query, user_account_number)
    
    return {"response": ai_answer}
