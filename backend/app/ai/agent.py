from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from app.ai.tools import get_current_balance, get_transaction_history, get_profile_details
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

def _extract_acc(acc: str | None) -> str | None:
    if isinstance(acc, str) and "account_number" in acc:
        match = re.search(r'account_number\s*=\s*["\']?([^,"\']+)', acc)
        if match: return match.group(1)
    return acc


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)


tools = [get_current_balance, get_transaction_history, get_profile_details]
llm_with_tools = llm.bind_tools(tools)


def ask_agent(question: str, user_account_number: str, user_accounts: list = None) -> str:
    today_str = datetime.now(IST).strftime("%Y-%m-%d")
    accounts_str = ", ".join(user_accounts) if user_accounts else "None"
    
    if user_account_number == "NONE" or not user_account_number:
        # User has not selected an account yet
        active_tools = [get_profile_details]
        system_context = f"""
        You are a financial assistant for SecureBank.
        Available User Accounts: {accounts_str}
        Selected Account: NONE
        Today's Date: {today_str}

        CRITICAL RULES:
        - The user has NOT selected an account yet.
        - You DO NOT have tools to check balance or transactions.
        - If the user asks about an account-specific financial detail (e.g., balance, transactions, history), you MUST reply EXACTLY with the prefix "REQUIRE_ACCOUNT:" followed by a short friendly message asking them which account to check. Example: "REQUIRE_ACCOUNT: Sure, which account's balance would you like to check?"
        - If the user asks a general profile query (e.g. name, age, contact info), you MUST use `get_profile_details` with the FIRST account from Available User Accounts as the argument.
        - Be clear and user-friendly.
        """
    else:
        # User has selected an account
        active_tools = [get_current_balance, get_transaction_history, get_profile_details]
        system_context = f"""
        You are a financial assistant for SecureBank.
        Available User Accounts: {accounts_str}
        Selected Account: {user_account_number}
        Today's Date: {today_str}

        RULES:
        - Always use tools for financial data when answering.
        - The user IS asking about the Selected Account ({user_account_number}).
        - Never guess or fabricate transactions.
        - Use returned JSON to answer.
        - Be clear and user-friendly.
        """
        
    bound_llm = llm.bind_tools(active_tools)

    messages = [
        {"role": "system", "content": system_context},
        {"role": "user", "content": question}
    ]
    
    try:
        
        response = bound_llm.invoke(messages)

        
        if response.tool_calls:
            tool_call = response.tool_calls[0]

            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            print("🔧 TOOL CALL:", tool_name)
            print("📦 ARGS:", tool_args)

            req_account = _extract_acc(tool_args.get("account_number"))
            
            if tool_name in ["get_transaction_history", "get_current_balance", "get_profile_details"]:
                if req_account not in user_accounts:
                    tool_output = json.dumps({"status": "error", "error": "Unauthorized account access."})
                else:
                    if tool_name == "get_transaction_history":
                        tool_output = get_transaction_history.invoke(tool_args)
                    elif tool_name == "get_current_balance":
                        tool_output = get_current_balance.invoke(tool_args)
                    elif tool_name == "get_profile_details":
                        tool_output = get_profile_details.invoke(tool_args)
            else:
                return "Unknown tool requested."

            print("📤 TOOL OUTPUT:", tool_output)

            
            messages.append(response)
            messages.append({
                "role": "tool",
                "content": tool_output,
                "tool_call_id": tool_call["id"]
            })

            final_response = bound_llm.invoke(messages)

            return final_response.content

    
        return response.content

    except Exception as e:
        print("Agent Error:", e)
        return "Something went wrong while processing your request."