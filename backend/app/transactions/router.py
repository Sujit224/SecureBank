from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app import schemas
from app import database_models
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.schemas import DepositRequest, TransferRequest
from sqlalchemy.orm import Session
from datetime import datetime, timezone

router = APIRouter(prefix="/transactions",tags = ["Transactions"])

@router.post("/deposit")
def deposit_money(deposit_request:DepositRequest,db:Session = Depends(get_db),current_user: database_models.User = Depends(get_current_user)):
    
    if deposit_request.amount > 200000:
        raise HTTPException(status_code=400, detail="Deposit limit exceeded. Maximum allowed is ₹2,00,000.")

    current_user.balance += deposit_request.amount

    transaction = database_models.Transaction(
        sender_account = "SELF",
        receiver_account = current_user.account_number,
        amount = deposit_request.amount,
        transaction_type = "DEPOSIT",
        description = deposit_request.description,
        status = "SUCCESS",
        timestamp = datetime.now(timezone.utc),
        receiver_balance = current_user.balance
    )

    db.add(transaction)
    db.commit()

    return{
        "message":"Deposit Successful",
        "new_balance":current_user.balance,
        "transaction_id":transaction.id
    }
    

@router.post("/send")
def transfer_money(transfer_request:TransferRequest,db:Session = Depends(get_db),current_user: database_models.User = Depends(get_current_user)):

    if transfer_request.reciever_account == current_user.account_number:
        raise HTTPException(status_code=400,detail="Cannot transfer to self.")
    
    reciever = db.query(database_models.User).filter(database_models.User.account_number == transfer_request.reciever_account).first()

    if not reciever:
        raise HTTPException(status_code=404,detail = "Reciever account not found.")
    
    if current_user.balance<transfer_request.amount:
        raise HTTPException(status_code=400,detail="Insufficient funds.")
    
    current_user.balance -= transfer_request.amount
    reciever.balance += transfer_request.amount

    transaction = database_models.Transaction(
        sender_account = current_user.account_number,
        receiver_account = transfer_request.reciever_account,
        amount = transfer_request.amount,
        transaction_type = "TRANSFER",
        description = transfer_request.description,
        status = "SUCCESS",
        timestamp = datetime.now(timezone.utc),
        
        
        sender_balance = current_user.balance,
        receiver_balance = reciever.balance
    )

    db.add(transaction)
    db.commit()

    return {"message": "Transfer Successful", "new_balance": current_user.balance}


@router.get("/history",response_model=schemas.PaginatedTransactionHistory)
def transaction_history(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):

    my_acc = current_user.account_number

    # Base query for filtering by user account
    query = db.query(database_models.Transaction).filter(
        (database_models.Transaction.sender_account == my_acc) |
        (database_models.Transaction.receiver_account == my_acc)
    )

    # Calculate total count before pagination
    total_count = query.count()

    # Apply pagination and sorting
    logs = query.order_by(database_models.Transaction.timestamp.desc())\
                .offset((page - 1) * limit)\
                .limit(limit)\
                .all()

    formatted_history = []

    for log in logs:
        if log.transaction_type == "DEPOSIT":
            display_type = "DEPOSIT"
            other_party = "SELF"
            my_balance_snapshot = log.receiver_balance

        elif log.sender_account == my_acc:
            display_type = "SENT"
            other_party = log.receiver_account
            my_balance_snapshot = log.sender_balance
        
        else:
            display_type = "RECEIVED"
            other_party = log.sender_account
            my_balance_snapshot = log.receiver_balance

        formatted_history.append(
            schemas.TransactionHistoryResponse(
                transaction_id = log.id,
                account_no = other_party,
                transaction_type = display_type,
                amount = log.amount,
                balance_after = my_balance_snapshot,
                description = log.description,
                status = log.status,
                timestamp = log.timestamp,                
            )
        )

    return {
        "total": total_count,
        "page": page,
        "size": limit,
        "items": formatted_history
    }