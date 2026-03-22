from datetime import datetime, timezone
from sqlalchemy import Column, Date,Integer,String,Float,DateTime,ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer,primary_key=True,index=True,autoincrement=True)
    username = Column(String(32),unique=True,index = True)
    email = Column(String(70),unique=True,index=True)
    password = Column(String(255))

    role = Column(String(10),default="user")
    
    mobile_number = Column(String(13))
    age = Column(Integer)
    profession = Column(String(20))
    income_range = Column(String(15))
    gender = Column(String(6))
    marital_status = Column(String(20))
    dob = Column(Date)

    created_at = Column(DateTime(timezone=True),server_default=func.now())

    accounts = relationship("Account",back_populates="owner",cascade="all,delete-orphan")

class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(Integer,primary_key=True,index = True,autoincrement=True)
    user_id = Column(Integer,ForeignKey("users.user_id"),nullable = False)
    account_number = Column(String(36),unique=True,index = True)
    balance = Column(Float,default = 0.0)

    account_type = Column(String(20),default = "Savings")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User",back_populates="accounts")


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