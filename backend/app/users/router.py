from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database_models, schemas
from app.auth.dependencies import get_current_user, get_db
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/users", tags=["Users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.get("/me", response_model=schemas.UserResponse)
async def get_user_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    target_user = await get_current_user(db, token)
    
    
    user_accounts = [
        schemas.AccountResponse(
            account_id=acc.account_id,
            account_number=acc.account_number,
            balance=acc.balance,
            account_type=acc.account_type,
            created_at=acc.created_at
        ) for acc in target_user.accounts
    ]

    
    return schemas.UserResponse(
        user_id=target_user.user_id,
        username=target_user.username,
        email=target_user.email,
        role=target_user.role,
        mobile_number=target_user.mobile_number,
        age=target_user.age,
        profession=target_user.profession,
        income_range=target_user.income_range,
        gender=target_user.gender,
        marital_status=target_user.marital_status,
        created_at=target_user.created_at,
        
        # Inject the list of accounts here!
        accounts=user_accounts 
    )

@router.post("/me/accounts", response_model=schemas.AccountResponse)
async def create_account(
    request: schemas.CreateAccountRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    from app.auth.utils import generate_account_number

    target_user = await get_current_user(db, token)

    new_account = database_models.Account(
        user_id=target_user.user_id,
        account_number=generate_account_number(),
        balance=0.0,
        account_type=request.account_type
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return new_account