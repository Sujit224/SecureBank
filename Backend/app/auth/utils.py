from passlib.context import CryptContext
from datetime import datetime,timedelta,timezone
from jose import jwt  # type: ignore
import os   
from dotenv import load_dotenv
import random
import string
import hashlib

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

pwd_context = CryptContext(schemes=["argon2"],deprecated="auto")

def get_password_hash(password:str) -> str:
    prehashed = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.hash(prehashed)

def verify_password(password: str, hashed_password: str) -> bool:
    prehashed = hashlib.sha256(password.encode("utf-8")).digest()
    return pwd_context.verify(prehashed, hashed_password)

def create_access_token(data:dict,expires_delta:timedelta | None=None):
    to_encode = data.copy()
    print(to_encode)
    expire = datetime.now(timezone.utc) +  (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)


def generate_account_number() -> str:    
    digits_part = ''.join(random.choices(string.digits,k=4))
    return "ACC"+digits_part