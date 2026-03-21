from datetime import datetime
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from app.ai.tools import get_current_balance, get_transaction_history
import os
from dotenv import load_dotenv
import json

load_dotenv()


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)


tools = [get_current_balance, get_transaction_history]
llm_with_tools = llm.bind_tools(tools)


def ask_agent(question: str, user_account_number: str) -> str:
    today_str = datetime.now().strftime("%Y-%m-%d")

    
    system_context = f"""
You are a financial assistant for SecureBank.

User Account: {user_account_number}
Today's Date: {today_str}

RULES:
- Always use tools for financial data
- Never guess or fabricate transactions
- Use returned JSON to answer
- Be clear and user-friendly
"""

    messages = [
        {"role": "system", "content": system_context},
        {"role": "user", "content": question}
    ]

    try:
        
        response = llm_with_tools.invoke(messages)

        
        if response.tool_calls:
            tool_call = response.tool_calls[0]

            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            print("🔧 TOOL CALL:", tool_name)
            print("📦 ARGS:", tool_args)

            
            if tool_name == "get_transaction_history":
                tool_output = get_transaction_history.invoke(tool_args)

            elif tool_name == "get_current_balance":
                tool_output = get_current_balance.invoke(tool_args)

            else:
                return "Unknown tool requested."

            print("📤 TOOL OUTPUT:", tool_output)

            
            messages.append(response)
            messages.append({
                "role": "tool",
                "content": tool_output,
                "tool_call_id": tool_call["id"]
            })

            final_response = llm_with_tools.invoke(messages)

            return final_response.content

    
        return response.content

    except Exception as e:
        print("Agent Error:", e)
        return "Something went wrong while processing your request."