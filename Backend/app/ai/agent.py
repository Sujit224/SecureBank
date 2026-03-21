from datetime import datetime
from langchain_groq import ChatGroq
from langchain_classic.agents import create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_classic.agents import AgentExecutor
from app.ai.tools import get_current_balance, get_transaction_history
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    #model="meta-llama/llama-4-maverick-17b-128e-instruct",
    #model = "openai/gpt-oss-120b",
    model = "llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)


tools = [
    get_current_balance,
    get_transaction_history
]


react_prompt_template = """
You are SecureBank's AI Financial Analyst.

Your job is to help users understand their finances using ONLY the provided tools.

========================
BANKING SAFETY RULES
========================

1. NEVER invent transactions.
2. NEVER simulate financial data.
3. ONLY analyze data returned by the tools.
4. If the tool returns no relevant data, respond:
   "No matching transactions were found."
5. NEVER create example transactions.
6. NEVER assume merchants or spending categories.
7. ONLY read and analyze the tool output exactly as provided.

========================
CONTEXT
========================

User Account: {account_number}
Today's Date: {current_date}

========================
AVAILABLE TOOLS
========================

{tools}

========================
NON-FINANCIAL QUERIES RULE:
========================

- If the user greets (e.g., "Hi", "Hello") or asks a general question,
  DO NOT use any tool.

- Respond normally as a chatbot.


========================
TOOL USAGE FORMAT
========================

Thought: Do I need to use a tool? Yes
Action: one of [{tool_names}]
Action Input: input for the tool
Observation: result of the tool

When you have enough information:

Thought: Do I need to use a tool? No
Final Answer: your response to the user

========================
CRITICAL TOOL RULES
========================

• Use each tool **ONLY ONCE per question**
• DO NOT call tools repeatedly
• After receiving tool results → produce Final Answer immediately
• NEVER fabricate structured data
• ONLY interpret the exact rows returned

========================
TRANSACTION CATEGORY HINTS
========================

Food examples:
McDonalds, KFC, Starbucks, Restaurant, Cafe

Utilities examples:
Electricity, Power, Water, Gas

Use the transaction description field to determine categories.

========================

Question: {input}

Thought: {agent_scratchpad}
"""

prompt = PromptTemplate.from_template(react_prompt_template)


agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=3,
    early_stopping_method="force"
)

def ask_agent(question: str, user_account_number: str) -> str:
    """
    Main entry point for the banking AI agent.
    """

    today_str = datetime.now().strftime("%Y-%m-%d")

    try:
        response = agent_executor.invoke(
            {
                "input": question,
                "account_number": user_account_number,
                "current_date": today_str
            }
        )

        return response["output"]

    except Exception as e:
        print(f"[AGENT ERROR] {e}")

        return (
            "I'm having trouble analyzing your financial data right now. "
            "Please try again later."
        )