from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta # Run: pip install python-dateutil
from app import database_models, schemas
from app.auth.dependencies import get_current_user
from app.database import get_db
import os
import json
from langchain_groq import ChatGroq

router = APIRouter()

@router.get("/{account_number}/analytics/cash-flow",response_model = schemas.AccountAnalyticsResponse)
def get_cash_flow_analytics(
    account_number:str,
    months_back:int=6,
    db:Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):

    account = db.query(database_models.Account).filter(
        database_models.Account.account_number == account_number,
        database_models.Account.user_id == current_user.user_id
    ).first()

    if not account:
        raise HTTPException(status_code=404,detail="Account not found")
    
    today = datetime.now(timezone.utc)
    start_date = (today - relativedelta(months=months_back - 1)).replace(day=1, hour=0, minute=0, second=0)
    
    transactions = db.query(database_models.Transaction).filter(
        or_(
            database_models.Transaction.sender_account == account.account_number,
            database_models.Transaction.receiver_account == account.account_number
        ),
        database_models.Transaction.timestamp >= start_date
    ).all()

    monthly_data = {}
    for i in range(months_back - 1, -1, -1):
        target_month = today - relativedelta(months=i)
        month_label = target_month.strftime("%b %Y") 
        monthly_data[month_label] = {"income": 0.0, "spending": 0.0}
    

    for tx in transactions:
        tx_month = tx.timestamp.strftime("%b %Y")

        if tx_month not in monthly_data:
            continue

        if tx.sender_account == account.account_number:
            monthly_data[tx_month]["spending"] += tx.amount

        elif tx.receiver_account == account.account_number:
            monthly_data[tx_month]["income"] += tx.amount
    
    
    formatted_data = []

    for month,data in monthly_data.items():
        formatted_data.append(
            schemas.MonthlyCashFlow(
                month = month,
                income = data["income"],
                spending = data["spending"],
                cash_flow = data["income"] - data["spending"]
            )
        )

    
    return schemas.AccountAnalyticsResponse(
        account_number=account.account_number,
        data=formatted_data
    )

@router.get("/{account_number}/analytics/categories", response_model=schemas.CategoryAnalyticsResponse)
def get_account_category_analytics(
    account_number: str,
    months_back: int = 1,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    account = db.query(database_models.Account).filter(
        database_models.Account.account_number == account_number,
        database_models.Account.user_id == current_user.user_id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    start_date = datetime.now(timezone.utc) - relativedelta(months=months_back)
    
    transactions = db.query(database_models.Transaction).filter(
        database_models.Transaction.sender_account == account.account_number,
        database_models.Transaction.timestamp >= start_date
    ).all()
    
    categories = {}
    for tx in transactions:
        cat = tx.category or "Others"
        if cat == "Income": continue # usually pie chart is for expenses
        categories[cat] = categories.get(cat, 0.0) + tx.amount
        
    data = [schemas.CategoryAnalytics(category=k, amount=v) for k, v in categories.items()]
    return schemas.CategoryAnalyticsResponse(account_number=account.account_number, data=data)

@router.get("/{account_number}/analytics/categories/monthly")
def get_monthly_category_analytics(
    account_number: str,
    months_back: int = 3,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    account = db.query(database_models.Account).filter(
        database_models.Account.account_number == account_number,
        database_models.Account.user_id == current_user.user_id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    today = datetime.now(timezone.utc)
    start_date = (today - relativedelta(months=months_back - 1)).replace(day=1, hour=0, minute=0, second=0)
    
    transactions = db.query(database_models.Transaction).filter(
        database_models.Transaction.sender_account == account.account_number,
        database_models.Transaction.timestamp >= start_date
    ).all()
    
    monthly_data = {}
    for i in range(months_back - 1, -1, -1):
        target_month = today - relativedelta(months=i)
        month_label = target_month.strftime("%b %Y") 
        monthly_data[month_label] = {}
        
    for tx in transactions:
        tx_month = tx.timestamp.strftime("%b %Y")
        if tx_month not in monthly_data:
            continue
            
        cat = tx.category or "Others"
        if cat == "Income": continue
        
        monthly_data[tx_month][cat] = monthly_data[tx_month].get(cat, 0.0) + tx.amount
        
    formatted_data = []
    for month, data in monthly_data.items():
        formatted_data.append({
            "month": month,
            "data": [{"category": k, "amount": v} for k, v in data.items()]
        })
        
    return {
        "account_number": account.account_number,
        "monthly_data": formatted_data
    }

@router.get("/profile/analytics/categories", response_model=schemas.CategoryAnalyticsResponse)
def get_profile_category_analytics(
    months_back: int = 1,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    accounts = db.query(database_models.Account).filter(
        database_models.Account.user_id == current_user.user_id
    ).all()
    
    account_numbers = [acc.account_number for acc in accounts]
    
    if not account_numbers:
        return schemas.CategoryAnalyticsResponse(account_number="all", data=[])
        
    start_date = datetime.now(timezone.utc) - relativedelta(months=months_back)
    
    transactions = db.query(database_models.Transaction).filter(
        database_models.Transaction.sender_account.in_(account_numbers),
        database_models.Transaction.timestamp >= start_date
    ).all()
    
    categories = {}
    for tx in transactions:
        cat = tx.category or "Others"
        if cat == "Income": continue
        categories[cat] = categories.get(cat, 0.0) + tx.amount
        
    data = [schemas.CategoryAnalytics(category=k, amount=v) for k, v in categories.items()]
    return schemas.CategoryAnalyticsResponse(account_number="all", data=data)

@router.get("/profile/analytics/categories/monthly")
def get_profile_monthly_category_analytics(
    months_back: int = 3,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    accounts = db.query(database_models.Account).filter(
        database_models.Account.user_id == current_user.user_id
    ).all()
    
    account_numbers = [acc.account_number for acc in accounts]
    if not account_numbers:
        return {"account_number": "all", "monthly_data": []}
        
    today = datetime.now(timezone.utc)
    start_date = (today - relativedelta(months=months_back - 1)).replace(day=1, hour=0, minute=0, second=0)
    
    transactions = db.query(database_models.Transaction).filter(
        database_models.Transaction.sender_account.in_(account_numbers),
        database_models.Transaction.timestamp >= start_date
    ).all()
    
    monthly_data = {}
    for i in range(months_back - 1, -1, -1):
        target_month = today - relativedelta(months=i)
        month_label = target_month.strftime("%b %Y") 
        monthly_data[month_label] = {}
        
    for tx in transactions:
        tx_month = tx.timestamp.strftime("%b %Y")
        if tx_month not in monthly_data:
            continue
            
        cat = tx.category or "Others"
        if cat == "Income": continue
        
        monthly_data[tx_month][cat] = monthly_data[tx_month].get(cat, 0.0) + tx.amount
        
    formatted_data = []
    for month, data in monthly_data.items():
        formatted_data.append({
            "month": month,
            "data": [{"category": k, "amount": v} for k, v in data.items()]
        })
        
    return {
        "account_number": "all",
        "monthly_data": formatted_data
    }

@router.get("/{account_number}/analytics/report")
def generate_analytics_report(
    account_number: str,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    if account_number == "profile":
        monthly_cat_data = get_profile_monthly_category_analytics(3, db, current_user)
        # Build cash-flow summary across all accounts
        accounts = db.query(database_models.Account).filter(
            database_models.Account.user_id == current_user.user_id
        ).all()
        account_numbers = [a.account_number for a in accounts]
        today = datetime.now(timezone.utc)
        start_date = (today - relativedelta(months=2)).replace(day=1, hour=0, minute=0, second=0)
        all_txns = db.query(database_models.Transaction).filter(
            database_models.Transaction.timestamp >= start_date
        ).all()
        
        cash_flow_monthly = {}
        for i in range(2, -1, -1):
            lbl = (today - relativedelta(months=i)).strftime("%b %Y")
            cash_flow_monthly[lbl] = {"income": 0.0, "spending": 0.0}
        
        for tx in all_txns:
            lbl = tx.timestamp.strftime("%b %Y")
            if lbl not in cash_flow_monthly: continue
            if tx.sender_account in account_numbers:
                cash_flow_monthly[lbl]["spending"] += tx.amount
            if tx.receiver_account in account_numbers:
                cash_flow_monthly[lbl]["income"] += tx.amount

        cash_flow_data = [{"month": m, **v} for m, v in cash_flow_monthly.items()]
        total_spending = sum(v["spending"] for v in cash_flow_monthly.values())
        total_income = sum(v["income"] for v in cash_flow_monthly.values())
    else:
        monthly_cat_data = get_monthly_category_analytics(account_number, 3, db, current_user)
        account = db.query(database_models.Account).filter(
            database_models.Account.account_number == account_number,
            database_models.Account.user_id == current_user.user_id
        ).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        today = datetime.now(timezone.utc)
        start_date = (today - relativedelta(months=2)).replace(day=1, hour=0, minute=0, second=0)
        all_txns = db.query(database_models.Transaction).filter(
            or_(
                database_models.Transaction.sender_account == account_number,
                database_models.Transaction.receiver_account == account_number
            ),
            database_models.Transaction.timestamp >= start_date
        ).all()
        
        cash_flow_monthly = {}
        for i in range(2, -1, -1):
            lbl = (today - relativedelta(months=i)).strftime("%b %Y")
            cash_flow_monthly[lbl] = {"income": 0.0, "spending": 0.0}
        
        for tx in all_txns:
            lbl = tx.timestamp.strftime("%b %Y")
            if lbl not in cash_flow_monthly: continue
            if tx.sender_account == account_number:
                cash_flow_monthly[lbl]["spending"] += tx.amount
            elif tx.receiver_account == account_number:
                cash_flow_monthly[lbl]["income"] += tx.amount

        cash_flow_data = [{"month": m, **v} for m, v in cash_flow_monthly.items()]
        total_spending = sum(v["spending"] for v in cash_flow_monthly.values())
        total_income = sum(v["income"] for v in cash_flow_monthly.values())

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API Key missing")
        
    try:
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.7,
            api_key=api_key,
            max_tokens=800
        )
        
        prompt = f"""You are a friendly, encouraging financial advisor for SecureBank.
Here is the user's spending data over the last 3 months:
{json.dumps(monthly_cat_data['monthly_data'], indent=2)}

Please analyze this data and provide a financial report. 
You MUST return your response ONLY as a valid JSON object with EXACTLY these keys:
{{
  "summary": "2-3 sentences on this month's total spending and top categories",
  "analysis": "Compare spending between the 3 months. Note improvements or regressions.",
  "tips": [
    "Specific tip 1 based on their highest spending categories",
    "Specific tip 2",
    "Specific tip 3"
  ]
}}
Do not include any other text, markdown formatting, or explanations outside the JSON."""
        
        response = llm.invoke(prompt)
        
        try:
            import re
            # Extract JSON block if it's wrapped in markdown code blocks
            json_str = response.content
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0]
                
            report_data = json.loads(json_str.strip())
        except json.JSONDecodeError:
            print("Failed to parse JSON from LLM. Raw output:", response.content)
            # Fallback to defaults
            report_data = {
                "summary": "Unable to generate summary at this time.",
                "analysis": "Unable to generate analysis at this time.",
                "tips": ["Review your categories to find saving opportunities.", "Set a monthly budget."]
            }
        
        return {
            "report_parsed": report_data,
            "monthly_data": monthly_cat_data['monthly_data'],
            "cash_flow": cash_flow_data,
            "total_spending": total_spending,
            "total_income": total_income,
            "generated_at": today.strftime("%d %b %Y, %I:%M %p UTC"),
            "account": account_number
        }
    except Exception as e:
        print("LLM Report Generation Error:", e)
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


# ─── Investment Advisor ────────────────────────────────────────────────────────

@router.get("/profile/investment-advisor")
def get_investment_recommendations(
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user)
):
    """
    Generate personalized investment recommendations based on:
    - User profile (age, marital status, income range, profession)
    - Total account balances
    - 3-month spending patterns
    """
    # Aggregate account balances
    accounts = db.query(database_models.Account).filter(
        database_models.Account.user_id == current_user.user_id
    ).all()
    total_balance = sum(a.balance for a in accounts)
    
    # Get 3-month spending summary
    today = datetime.now(timezone.utc)
    start_date = (today - relativedelta(months=2)).replace(day=1, hour=0, minute=0, second=0)
    account_numbers = [a.account_number for a in accounts]
    
    recent_txns = db.query(database_models.Transaction).filter(
        database_models.Transaction.sender_account.in_(account_numbers),
        database_models.Transaction.timestamp >= start_date
    ).all()
    
    monthly_spend = {}
    for tx in recent_txns:
        lbl = tx.timestamp.strftime("%b %Y")
        monthly_spend[lbl] = monthly_spend.get(lbl, 0.0) + tx.amount
    
    avg_monthly_spend = (sum(monthly_spend.values()) / len(monthly_spend)) if monthly_spend else 0
    
    user_context = {
        "age": current_user.age,
        "marital_status": current_user.marital_status,
        "profession": current_user.profession,
        "income_range": current_user.income_range,
        "gender": current_user.gender,
        "total_balance": round(total_balance, 2),
        "avg_monthly_spending": round(avg_monthly_spend, 2),
        "num_accounts": len(accounts),
    }
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API Key missing")
    
    try:
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.6,
            api_key=api_key,
            max_tokens=1200
        )
        
        prompt = f"""You are a certified financial advisor at SecureBank in India.
Here is a customer's profile:
{json.dumps(user_context, indent=2)}

Based on this profile, generate EXACTLY a JSON object with personalized investment recommendations. Return ONLY valid JSON, nothing else.

The JSON must have this exact structure:
{{
  "risk_profile": "Conservative" | "Moderate" | "Aggressive",
  "risk_reasoning": "One sentence why this risk profile fits them",
  "investable_surplus": <estimated monthly amount in INR they can invest, as integer>,
  "personalized_recommendations": [
    {{
      "type": "Fixed Deposit" | "Mutual Fund" | "Health Insurance" | "Life Insurance" | "PPF" | "NPS" | "ELSS" | "RD",
      "plan_name": "Plan name",
      "provider": "Bank/Company name",
      "is_securebank": true | false,
      "reason": "Why this is perfect for this specific user (1-2 sentences referencing their profile)",
      "priority": "High" | "Medium",
      "suggested_amount": <monthly/lump sum amount as integer in INR>
    }}
  ]
}}

Rules:
- Recommend 5-7 plans total
- Always include at least 2 SecureBank plans (is_securebank: true). SecureBank offers: Fixed Deposits at 8.2% p.a., Recurring Deposits at 7.5% p.a., SecureWealth Equity Fund (mutual fund), SecureShield Health Plan, SecureLife Term Plan
- For age > 45, always include a health insurance plan
- For age < 35 with aggressive risk, recommend equity mutual funds
- Include government schemes (PPF/NPS/ELSS) for tax saving if income is high
- Prioritize High for plans that match their exact profile
- suggested_amount should be realistic given their balance and spending"""
        
        response = llm.invoke(prompt)
        json_str = response.content.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0]
        
        recommendations = json.loads(json_str.strip())
        
        return {
            "user_context": user_context,
            "recommendations": recommendations,
        }
    except json.JSONDecodeError as e:
        print("JSON parse error:", e, "\nRaw:", response.content if 'response' in dir() else "N/A")
        raise HTTPException(status_code=500, detail="Failed to parse recommendations from AI")
    except Exception as e:
        print("Investment advisor error:", e)
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")