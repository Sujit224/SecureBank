from datetime import datetime, timezone
from sqlalchemy import Column, Date,Integer,String,Float,DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer,primary_key=True,index=True,autoincrement=True)
    username = Column(String(32),unique=True,index = True)
    email = Column(String(70),unique=True,index=True)
    password = Column(String(255))

    role = Column(String(10),default="user")
    account_number = Column(String(36),unique=True,index=True)
    balance = Column(Float,default=0.0)

    mobile_number = Column(String(13))
    age = Column(Integer)
    profession = Column(String(20))
    income_range = Column(String(15))
    gender = Column(String(6))
    marital_status = Column(String(20))
    dob = Column(Date)

    created_at = Column(DateTime(timezone=True),server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    sender_account = Column(String(36), index=True)  
    receiver_account = Column(String(36), index=True) 
    amount = Column(Float)
    transaction_type = Column("type", String(20))
    description = Column(String(255)) 
    status = Column(String(20))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    sender_balance = Column(Float, default=0.0)
    receiver_balance = Column(Float, default=0.0)