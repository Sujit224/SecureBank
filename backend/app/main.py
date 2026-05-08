from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.transactions.router import router as transactions_router
from app.ai.router import router as ai_router
from app.analytics.router import router as analytics_router
from app import database_models
from app.database import engine
app = FastAPI()

database_models.Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(transactions_router)
app.include_router(ai_router)
app.include_router(analytics_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "System is running."}