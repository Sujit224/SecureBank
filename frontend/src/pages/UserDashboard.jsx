import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { Send, TrendingUp } from 'lucide-react';
import './Dashboard.css'; // Import the styles

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    API.get('/users/me').then(res => setUser(res.data));
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await API.post('/transactions/send', {
        receiver_account: receiver,
        amount: parseFloat(amount),
        type: "TRANSFER"
      });
      setStatus({ type: 'success', msg: 'Transfer Successful!' });
      // Refresh balance
      API.get('/users/me').then(res => setUser(res.data));
      setAmount(''); setReceiver('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.detail || "Failed" });
    }
  };

  if (!user) return <div className="text-center pt-20">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="container dashboard-page animate-fade">
        <h1 className="dashboard-title">My Dashboard</h1>
        
        <div className="dashboard-grid">
          
          {/* LEFT: Balance Card */}
          <div className="glass-card balance-card">
            <TrendingUp size={80} color="#333" style={{ position: 'absolute', top: 20, right: 20, opacity: 0.5 }} />
            
            <p className="balance-label">Total Balance</p>
            <h2 className="balance-amount">${user.balance.toLocaleString()}</h2>
            
            <div className="card-details">
              <div>
                <p className="balance-label">Account Holder</p>
                <p style={{ fontSize: '1.2rem' }}>{user.username}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="balance-label">Account No.</p>
                <p className="highlight-text">{user.account_number}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Transfer Form */}
          <div className="glass-card transfer-card">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Quick Transfer</h3>
            
            <form onSubmit={handleTransfer}>
              <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Receiver Account</label>
              <input 
                className="input-field" 
                placeholder="e.g. ACC12345678"
                value={receiver}
                onChange={e => setReceiver(e.target.value)} 
              />
              
              <label style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Amount ($)</label>
              <input 
                className="input-field" 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)} 
              />

              {status && (
                <div className={`status-msg ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
                  {status.msg}
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Send size={18} /> Send Money
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default UserDashboard;