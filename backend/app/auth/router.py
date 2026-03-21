from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import database_models, schemas
from app.auth.dependencies import get_current_user, get_db
from app.auth.utils import create_access_token, get_password_hash,generate_account_number, verify_password
from fastapi.security import OAuth2PasswordBearer


router = APIRouter(prefix="/auth",tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/signup",response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate,db:Session = Depends(get_db)):
    db_user = db.query(database_models.User).filter(database_models.User.username==user.username).first()

    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    hashed_pwd = get_password_hash(user.password)
    acct_no = generate_account_number()

    user = database_models.User(
        username = user.username,
        email = user.email,
        password = hashed_pwd,
        role = user.role,
        account_number=acct_no,
        balance = 0.0,
        created_at = datetime.now(),
        mobile_number = user.mobile_number,
        age = user.age,
        profession = user.profession,
        income_range = user.income_range,
        gender = user.gender,
        marital_status = user.marital_status,
        dob = user.dob)
    
    db.add(user)
    db.commit()

    return user



@router.post("/login",response_model=schemas.Token)
def login(form_data:Annotated[OAuth2PasswordRequestForm,Depends()], db: Session = Depends(get_db)):
    
    db_user = db.query(database_models.User).filter(database_models.User.username==form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=400,detail="Invalid credentials")
    
    if not verify_password(form_data.password,db_user.password):
        raise HTTPException(status_code=400,detail="Incorrect credentials")
    
    access_token = create_access_token(data={"sub":db_user.username,"role":db_user.role})

    return {"access_token":access_token,"token_type":"bearer"}

    



