from sqlalchemy import Column, Date,Integer,String,Float,DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer,primary_key=True,index=True)
    username = Column(String,unique=True,index = True)
    email = Column(String,unique=True,index=True)
    password = Column(String)

    role = Column(String,default="user")
    account_number = Column(String,unique=True,index=True)
    balance = Column(Float,default=0.0)

    mobile_number = Column(String)
    age = Column(Integer)
    profession = Column(String)
    income_range = Column(String)
    gender = Column(String)
    marital_status = Column(String)
    dob = Column(Date)

    created_at = Column(DateTime(timezone=True),server_default=func.now())