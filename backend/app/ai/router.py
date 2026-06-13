from fastapi import APIRouter,Depends,HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import Optional
from app.auth.dependencies import get_current_user, get_db
from sqlalchemy.orm import Session
from app.database_models import User, Account
from app.ai.agent import ask_agent
import os
import requests

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

@router.post("/transcribe")
def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
        
    try:
        file_bytes = file.file.read()
        headers = {
            "Authorization": f"Bearer {groq_api_key}"
        }
        files = {
            "file": (file.filename or "audio.webm", file_bytes, file.content_type or "audio/webm")
        }
        data = {
            "model": "whisper-large-v3",
            "response_format": "json",
            "temperature": "0.0"
        }
        
        response = requests.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers,
            files=files,
            data=data
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Groq API error: {response.text}"
            )
            
        result = response.json()
        return {"text": result.get("text", "")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
