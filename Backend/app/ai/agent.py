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
    model="meta-llama/llama-4-maverick-17b-128e-instruct",
    # model = "openai/gpt-oss-120b",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)


tools = [get_current_balance, get_transaction_history]


react_prompt_template = """
You are an intelligent financial analyst for SecureBank.
Your goal is to help users understand their finances using the provided tools.

=== CONTEXT ===
- User Account: {account_number}
- Today's Date: {current_date}

=== TOOLS ===
You have access to the following tools:

{tools}

=== FORMAT ===
To use a tool, please use the following format:

Thought: Do I need to use a tool? Yes
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action

When you have a response to say to the Human, or if you do not need to use a tool, you must use the format:

Thought: Do I need to use a tool? No
Final Answer: [your response here]

=== CRITICAL INSTRUCTIONS FOR TOOL INPUT ===
1. You must ONLY USE EACH TOOL ONCE per question.
2. Once you have fetched the necessary information, you MUST immediately output a 'Final Answer:'.
3. DO NOT repeat the same tool calls recursively. 
4. DO NOT loop unconditionally.
5. IF USING MULTIPLE ARGUMENTS, DO NOT USE JSON. For get_transaction_history, you MUST use python kwargs string format: account_number="ACCXYZ", start_date="2026-02-01", end_date="2026-02-28"
6. If the user asks for "Food" spending, look for: McDonalds, KFC, Starbucks, etc.
7. If the user asks for "Utilities", look for: Electricity, Water, Power.
8. Always check the "Desc" (Description) in the transaction history.

Begin!

Question: {input}
Thought:{agent_scratchpad}
"""

prompt = PromptTemplate.from_template(react_prompt_template)


agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
    max_iterations=3,
    # early_stopping_method="generate"
)

def ask_agent(question: str, user_account_number: str) -> str:
    # Calculate dynamic date context
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    try:
        response = agent_executor.invoke({
            "input": question,
            "account_number": user_account_number,
            "current_date": today_str
        })
        return response['output']
    except Exception as e:
        print(f"Agent Error: {e}")
        return "I'm having trouble analyzing your financial data right now. Please try again later."