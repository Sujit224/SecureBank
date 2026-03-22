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

@router.post("/{account_number}/deposit")
def deposit_money(
    account_number: str,
    deposit_request:DepositRequest,
    db:Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    
    if deposit_request.amount > 200000:
        raise HTTPException(status_code=400, detail="Deposit limit exceeded. Maximum allowed is ₹2,00,000.")

    account = db.query(database_models.Account).filter(
        database_models.Account.account_number == account_number,
        database_models.Account.user_id == current_user.user_id
    ).first()

    if not account:
        raise HTTPException(status_code=404,detail = "Account not found.")

    account.balance += deposit_request.amount

    transaction = database_models.Transaction(
        sender_account = "SELF",
        receiver_account = account.account_number,
        amount = deposit_request.amount,
        transaction_type = "DEPOSIT",
        description = deposit_request.description,
        status = "SUCCESS",
        timestamp = datetime.now(timezone.utc),
        receiver_balance = account.balance
    )

    db.add(transaction)
    db.commit()

    return{
        "message":"Deposit Successful",
        "new_balance":account.balance,
        "transaction_id":transaction.id
    }
    

@router.post("/{account_number}/send")
def transfer_money(
    account_number: str,
    transfer_request:TransferRequest,
    db:Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):

    if transfer_request.reciever_account == account_number:
        raise HTTPException(status_code=400,detail="Cannot transfer to self.")
    

    sender_account = db.query(database_models.Account).filter(
        database_models.Account.account_number == account_number,
        database_models.Account.user_id == current_user.user_id
    ).first()

    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account not found or unauthorized.")


    reciever_account = db.query(database_models.Account).filter(
        database_models.Account.account_number == transfer_request.reciever_account
    ).first()

    if not reciever_account:
        raise HTTPException(status_code=404,detail = "Receiver account not found.")

    if sender_account.balance < transfer_request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")
    

    
    sender_account.balance -= transfer_request.amount
    reciever_account.balance += transfer_request.amount

    transaction = database_models.Transaction(
        sender_account = sender_account.account_number,
        receiver_account = reciever_account.account_number,
        amount = transfer_request.amount,
        transaction_type = "TRANSFER",
        description = transfer_request.description,
        status = "SUCCESS",
        timestamp = datetime.now(timezone.utc),
        
        
        sender_balance = sender_account.balance,
        receiver_balance = reciever_account.balance
    )

    db.add(transaction)
    db.commit()

    return {
        "message": "Transfer Successful",
        "new_balance": sender_account.balance
    }


@router.get("/{account_number}/history", response_model=schemas.PaginatedTransactionHistory)
def transaction_history(
    account_number: str,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    
    account = db.query(database_models.Account).filter(
        database_models.Account.account_number == account_number,
        database_models.Account.user_id == current_user.user_id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found or unauthorized.")

    my_acc = account.account_number

    
    query = db.query(database_models.Transaction).filter(
        (database_models.Transaction.sender_account == my_acc) |
        (database_models.Transaction.receiver_account == my_acc)
    )

    
    total_count = query.count()

    
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
                transaction_id=log.id,
                account_no=other_party,
                transaction_type=display_type,
                amount=log.amount,
                balance_after=my_balance_snapshot,
                description=log.description,
                status=log.status,
                timestamp=log.timestamp,                
            )
        )

    return {
        "total": total_count,
        "page": page,
        "size": limit,
        "items": formatted_history
    }