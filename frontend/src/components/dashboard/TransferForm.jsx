import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../../api/axios';

const TransferForm = ({ accountNumber, onTransferSuccess }) => {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await API.post(`/transactions/${accountNumber}/send`, {
        reciever_account: receiver,
        amount: parseFloat(amount),
        description: description,
      });
      setStatus({ type: 'success', msg: 'Transfer Successful!' });
      setAmount(''); 
      setReceiver('');
      setDescription('');
      if(onTransferSuccess) onTransferSuccess(); // Callback to refresh balance
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.detail || "Transaction Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-section animate-fade">

      
      <div className="glass-card transfer-card-large">
         <div className="transfer-header">
            <div className="icon-box">
               <Send size={24} />
            </div>
            <div>
               <h3>Quick Transfer</h3>
               <p>Send money instantly to any SecureBank account.</p>
            </div>
         </div>

         <form onSubmit={handleTransfer} className="transfer-form-large">
            <div className="form-group">
                <label>Receiver Account Number</label>
                <input 
                    className="input-field" 
                    placeholder="e.g. ACC12345"
                    value={receiver}
                    onChange={e => setReceiver(e.target.value)}
                    required
                />
            </div>
            
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
                    placeholder="What's this for?"
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
                {loading ? 'Processing...' : 'Send Money Securely'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default TransferForm;
