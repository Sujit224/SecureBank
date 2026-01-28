from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import database_models, schemas
from app.auth.dependencies import get_current_user, get_db
from app.auth.utils import create_access_token, get_password_hash,generate_account_number, verify_password
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/users",tags=["Autenciation"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.get("/me")
async def get_user_profile(token: str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    target_user = await get_current_user(db,token)
    return schemas.UserResponse(
        username = target_user.username,
        email = target_user.email,
        role = target_user.role,
        account_number = target_user.account_number,
        balance = target_user.balance,
        created_at =  target_user.created_at,

        mobile_number = target_user.mobile_number,
        age = target_user.age,
        profession = target_user.profession,
        income_range = target_user.income_range,
    )