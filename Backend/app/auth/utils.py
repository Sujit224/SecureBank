from passlib.context import CryptContext
from datetime import datetime,timedelta,timezone
from jose import jwt  # type: ignore
import os   
from dotenv import load_dotenv
import random
import string

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

def get_password_hash(password:str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password:str,hashed_password:str):
    return pwd_context.verify(plain_password,hashed_password)


def create_access_token(data:dict,expires_delta:timedelta | None=None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) +  (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)


def generate_account_number() -> str:    
    digits_part = ''.join(random.choices(string.digits,k=4))
    return "ACC"+digits_part