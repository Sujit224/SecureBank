import React, { useState } from 'react';
import { DollarSign, CheckCircle } from 'lucide-react';

const DepositMoney = () => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return;
    }
    // Simulate API call
    setTimeout(() => {
        setMessage(`Successfully deposited ₹${amount}.`);
        setAmount('');
        // Clear message after a few seconds
        setTimeout(() => setMessage(''), 3000);
    }, 500);
  };

  return (
    <div className="deposit-container animate-fade">
      <div className="deposit-card glass-card">
          <div className="deposit-header">
            <div className="icon-circle">
                <DollarSign size={32} />
            </div>
            <h2 className="section-title text-center">Deposit Money</h2>
            <p className="text-secondary text-center">Add funds to your secure account instantly</p>
          </div>

          <form onSubmit={handleDeposit} className="deposit-form">
            <div className="form-group">
                <label>Amount to Deposit</label>
                <div className="amount-wrapper">
                    <span className="currency">₹</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="deposit-input"
                        placeholder="0.00"
                        min="1"
                        required
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary full-width">
                Deposit Funds
            </button>
          </form>

          {message && (
            <div className="success-message">
                <CheckCircle size={20} />
                <p>{message}</p>
            </div>
          )}
      </div>

      <style>{`
        .deposit-container {
            display: flex;
            justify-content: center;
            padding-top: 40px;
        }
        .deposit-card {
            width: 100%;
            max-width: 500px;
            padding: 40px;
        }
        .deposit-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 32px;
        }
        .icon-circle {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #F0FFF4;
            color: #059669;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }
        .text-center { text-align: center; }
        .text-secondary { color: var(--color-text-secondary); }
        
        .deposit-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .amount-wrapper {
            position: relative;
        }
        .currency {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-text-secondary);
            font-size: 1.1rem;
            font-weight: 500;
        }
        .deposit-input {
            width: 100%;
            padding: 14px 16px 14px 40px; /* Space for currency symbol */
            font-size: 1.1rem;
            border-radius: 12px;
            border: 1px solid var(--color-border);
            background: var(--color-bg-primary);
        }
        .deposit-input:focus {
            border-color: var(--color-accent-purple);
            outline: none;
        }
        .full-width { width: 100%; }
        
        .success-message {
            margin-top: 24px;
            padding: 16px;
            background: #F0FFF4;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #047481;
            font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default DepositMoney;
