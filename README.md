# 🏦 SecureBank

![SecureBank App Preview](https://via.placeholder.com/1200x600?text=SecureBank+-+The+Future+of+Banking)

SecureBank is a modern, full-stack banking application that combines traditional banking features with an intelligent, AI-powered financial assistant. The application allows users to manage multiple accounts, perform core financial transactions, visualize their cash flow, and interact with an integrated Langchain chatbot.

## ✨ Features

### 👤 Comprehensive User Management
- **Detailed Profiles**: Capture rich demographic information including age, profession, income range, gender, and marital status.
- **Secure Authentication**: Robust JWT-based authentication ensuring secure sessions and data privacy.
- **Multi-Account System**: Users can open and manage multiple accounts (Savings, Current) seamlessly under a single profile.

### 💸 Core Banking Operations
- **Deposits**: Add funds to your accounts securely.
- **Transfers**: Send money between different accounts with real-time balance updates.
- **Transaction History**: Paginated, detailed history clearly indicating whether funds were Sent, Received, or Deposited, along with a rolling balance snapshot.

### 📊 Cash Flow Analytics
- **Visual Dashboards**: Beautiful, dynamic bar charts built with `Recharts`.
- **Income vs. Spending**: Track financial behavior over the past months.
- **Net Cash Flow**: Automatically calculates and highlights net cash flow in intuitive custom tooltips.

### 🤖 Intelligent AI Assistant
- **Integrated Chatbot**: Ask questions about your bank details, check your balance, or inquire about past transactions.
- **Context-Aware**: The agent intelligently asks for account selection when you query account-specific data, but answers general profile questions instantly.
- **Powered by Langchain & Groq**: Fast and accurate natural language processing acting as a virtual teller.

---

## 🛠️ Technology Stack

**Frontend**
- React 19 + Vite
- React Router DOM
- Recharts (Data Visualization)
- Axios (API Client)
- Lucide React (Icons)
- Vanilla CSS with modern Glassmorphism elements

**Backend**
- Python 3.10+
- FastAPI (High-performance web framework)
- SQLAlchemy (ORM)
- MySQL / PyMySQL (Relational Database)
- Langchain & Groq (AI Agent logic)
- Pydantic & Python-jose (Validation & JWT Auth)

---

## 🚀 Getting Started

Follow these steps to get the project running locally on your machine.

### Prerequisites
- Python 3.10 or higher
- Node.js v18+ and npm
- MySQL Server (Running locally or via a cloud provider)

### 1. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables**
Create a `.env` file in the `backend/` directory with your database and AI API keys:
```env
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=securebank

GROQ_API_KEY=your_groq_api_key_here
```

**Run the Backend Server**
```bash
uvicorn app.main:app --reload
```
The backend will run on `http://127.0.0.1:8000`. You can view the API documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

Open a new terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

**Run the Frontend Development Server**
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## 📁 Project Structure Overview

```text
SecureBank/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── ai/               # Langchain Chatbot Logic
│   │   ├── analytics/        # Cash Flow & Data Aggregation
│   │   ├── auth/             # JWT Authentication
│   │   ├── transactions/     # Deposit, Transfer, History endpoints
│   │   ├── users/            # Profile and Account Management
│   │   ├── database.py       # SQLAlchemy engine and session
│   │   ├── database_models.py# ORM Table Definitions
│   │   ├── schemas.py        # Pydantic validation models
│   │   └── main.py           # FastAPI entry point
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React Application
    ├── src/
    │   ├── api/              # Axios configuration & interceptors
    │   ├── components/       # Reusable UI components & Dashboard items
    │   ├── context/          # React Context (AuthContext)
    │   ├── pages/            # Page components (Login, Dashboard, Account Selector)
    │   ├── App.jsx           # App routing logic
    │   └── index.css         # Global styling and variables
    └── package.json          # Node dependencies
```

---

## 🔒 Security
- Passwords are securely hashed using `bcrypt`/`passlib[argon2]`.
- All protected endpoints require a valid JWT `Bearer` token.
- API limits and basic transaction bounds are enforced on the server-side to prevent exploits.
