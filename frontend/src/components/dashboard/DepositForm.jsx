import React, { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../../api/axios';

const DepositForm = ({ accountNumber, onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setStatus(null);
    
    if (parseFloat(amount) > 200000) {
        setStatus({ type: 'error', msg: 'Deposit limit allowed is ₹2,00,000' });
        return;
    }

    setLoading(true);

    try {
      await API.post(`/transactions/${accountNumber}/deposit`, {
        amount: parseFloat(amount),
        description: description,
      });
      setStatus({ type: 'success', msg: 'Deposit Successful!' });
      setAmount(''); 
      setDescription('');
      if(onDepositSuccess) onDepositSuccess(); // Callback to refresh balance
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.detail || "Deposit Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-section animate-fade">
      
      <div className="glass-card transfer-card-large">
         <div className="transfer-header">
            <div className="icon-box">
               <Wallet size={24} />
            </div>
            <div>
               <h3>Deposit Funds</h3>
               <p>Add money to your SecureBank account.</p>
            </div>
         </div>

         <form onSubmit={handleDeposit} className="transfer-form-large">
            
            <div className="form-group">
                <label>Amount (INR)</label>
                <div className="amount-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input 
                        className="input-field pl-8" 
                        type="number" 
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                        min="1"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Description</label>
                <input 
                    className="input-field" 
                    placeholder="Source of funds, reason, etc."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            {status && (
                <div className={`status-msg-large ${status.type === 'success' ? 'success' : 'error'}`}>
                   {status.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                   {status.msg}
                </div>
            )}

            <button disabled={loading} className="btn-primary transfer-btn">
                {loading ? 'Processing...' : 'Deposit Funds'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default DepositForm;
