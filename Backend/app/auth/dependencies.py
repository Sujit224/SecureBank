from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt # pyright: ignore[reportMissingModuleSource]
from requests import Session, session 
from Backend.app import database_models
from app.database import users_db
import os


SECRET_KEY= os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="authh/login")

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(db: Session=Depends(get_db),token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers = {"WWW-Authenciate":"Bearer"},
    )

    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        username:str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(database_models.User).filter(database_models.User.email == payload.get("sub")).first()

    if not user:
        raise credentials_exception
    return user
