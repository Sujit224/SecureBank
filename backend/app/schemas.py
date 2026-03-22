from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional, List
from datetime import date, datetime, timezone

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

class AccountResponse(BaseModel):
    account_id: int
    account_number: str
    balance: float
    account_type : str
    created_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    username: str
    email: str
    role: str
    created_at: datetime
    mobile_number:str
    age: int
    profession: str
    income_range : str
    gender: str
    marital_status: str

    accounts: List[AccountResponse] = []

    class Config:
        from_attributes = True


class CreateAccountRequest(BaseModel):
    account_type: Literal["Savings", "Current"] = "Savings"


class Token(BaseModel):
    access_token:str
    token_type: str


# Transaction Schemas

class DepositRequest(BaseModel):
    amount:float
    description:str


class TransferRequest(BaseModel):
    reciever_account:str
    amount:float
    description:str

class TransactionHistoryResponse(BaseModel):
    transaction_id:int
    account_no:str
    transaction_type:str
    amount:float
    balance_after:float
    description:str
    status:str
    timestamp:datetime

    @field_validator('timestamp')
    def set_timezone(cls, v):
        if v and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
            return v
   
    class Config:
        from_attributes = True

class PaginatedTransactionHistory(BaseModel):
    total: int
    page: int
    size: int
    items: List[TransactionHistoryResponse]
