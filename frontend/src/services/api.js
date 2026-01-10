export const apiService = {
  login: async (email, password, role) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access_token: 'mock_jwt_token_' + role,
          token_type: 'bearer',
          user: {
            id: 1,
            email,
            full_name: role === 'admin' ? 'Admin User' : 'John Doe',
            role,
            account_number: role === 'user' ? 'ACC123456789' : null
          }
        });
      }, 500);
    });
  },

  getUserProfile: async (token) => {
    return {
      id: 1,
      email: 'user@bank.com',
      full_name: 'John Doe',
      phone: '+1 (555) 123-4567',
      account_number: 'ACC123456789',
      account_type: 'Savings',
      created_at: '2024-01-15T10:30:00Z'
    };
  },

  getBalance: async (token) => {
    return {
      account_number: 'ACC123456789',
      available_balance: 15420.50,
      pending_balance: 200.00,
      currency: 'USD'
    };
  },

  getTransactions: async (token) => {
    return [
      { 
        id: 1, 
        date: '2025-01-08', 
        description: 'Salary Deposit', 
        account_number: 'ACC-PAYROLL-01', // New Field
        amount: 5000.00, 
        balance: 15420.50,                // New Field
        type: 'credit', 
        status: 'completed' 
      },
      { 
        id: 2, 
        date: '2025-01-07', 
        description: 'Grocery Store', 
        account_number: 'POS-WALMART-99', 
        amount: -125.50, 
        balance: 10420.50, 
        type: 'debit', 
        status: 'completed' 
      },
      { 
        id: 3, 
        date: '2025-01-06', 
        description: 'Electric Bill', 
        account_number: 'UTIL-POWER-88', 
        amount: -89.99, 
        balance: 10546.00, 
        type: 'debit', 
        status: 'completed' 
      },
      { 
        id: 4, 
        date: '2025-01-05', 
        description: 'Transfer to Savings', 
        account_number: 'ACC-SAVINGS-01', 
        amount: -500.00, 
        balance: 10635.99, 
        type: 'debit', 
        status: 'completed' 
      },
      { 
        id: 5, 
        date: '2025-01-04', 
        description: 'Refund - Amazon', 
        account_number: 'REF-AMZN-RTN', 
        amount: 45.99, 
        balance: 11135.99, 
        type: 'credit', 
        status: 'completed' 
      }
    ];
  },

  
  transferFunds: async (token, transferData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transaction_id: 'TXN' + Date.now(),
          status: 'pending',
          message: 'Transfer initiated successfully'
        });
      }, 1000);
    });
  },

  getFraudAlerts: async (token) => {
    return [
      {
        id: 1,
        transaction_id: 'TXN789456123',
        account_number: 'ACC987654321',
        amount: 9500.00,
        risk_score: 0.92,
        reason: 'Unusual large transaction',
        timestamp: '2025-01-08T14:23:00Z',
        status: 'pending'
      },
      {
        id: 2,
        transaction_id: 'TXN789456124',
        account_number: 'ACC456789123',
        amount: 3200.00,
        risk_score: 0.78,
        reason: 'Multiple transactions in short time',
        timestamp: '2025-01-08T13:15:00Z',
        status: 'pending'
      },
      {
        id: 3,
        transaction_id: 'TXN789456125',
        account_number: 'ACC123987654',
        amount: 1500.00,
        risk_score: 0.65,
        reason: 'Geolocation anomaly detected',
        timestamp: '2025-01-08T12:45:00Z',
        status: 'reviewing'
      }
    ];
  }
};