from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from datetime import date, datetime

# Auth Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"

    mobile_number: str
    age:int
    profession: str
    gender: str = Field(...,description="Male,Female,Other")
    # marital_status:str = Field(...,description="Single,Married,etc.")
    marital_status: Literal[
        "Single",
        "Married",
        "Widowed",
        "Divorced"
    ]
    dob: date
    income_range: Literal[
        "0-5 LPA",
        "5-10 LPA",
        "10-20 LPA",
        "20-30 LPA",
        "30+ LPA"
    ]


class UserResponse(BaseModel):
    username: str
    email: str
    role: str
    account_number: Optional[str] = None
    balance: float
    created_at: datetime

    mobile_number:str
    age: int
    profession: str
    income_range : str


class Token(BaseModel):
    access_token:str
    token_type: str


# Transaction Schemas
