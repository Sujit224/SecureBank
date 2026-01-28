import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/landing/Navbar';
import { Send, TrendingUp, User, Smartphone, Briefcase, Calendar, DollarSign, Mail } from 'lucide-react';
import './Dashboard.css';

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

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="dashboard-page animate-fade">
        <div className="container">
          <h1 className="dashboard-title">Welcome back, {user.username}</h1>
          
          <div className="dashboard-grid">
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Black Balance Card */}
                <div className="glass-card balance-card">
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>
                       <TrendingUp size={120} color="#fff" /> 
                    </div>
                    
                    <div>
                        <p className="balance-label">Total Balance</p>
                        <h2 className="balance-amount">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                    </div>
                    
                    <div className="card-details">
                    <div>
                        <p className="balance-label">Account Holder</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>{user.username}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p className="balance-label">Account No.</p>
                        <p className="highlight-text">{user.account_number}</p>
                    </div>
                    </div>
                </div>

                {/* 2. Quick Transfer */}
                <div className="glass-card transfer-card">
                    <h3 className="flex items-center gap-2">
                        <Send size={24} className="text-purple-600" /> Quick Transfer
                    </h3>
                    
                    <form onSubmit={handleTransfer}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Receiver Account</label>
                            <input 
                                className="input-field" 
                                placeholder="e.g. ACC..."
                                value={receiver}
                                onChange={e => setReceiver(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Amount ($)</label>
                            <input 
                                className="input-field" 
                                type="number" 
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)} 
                            />
                        </div>
                    </div>

                    {status && (
                        <div className={`status-msg ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
                        {status.msg}
                        </div>
                    )}

                    <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        Send Money
                    </button>
                    </form>
                </div>

            </div>

            {/* RIGHT COLUMN: Profile Details */}
            <div className="glass-card profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h3>{user.username}</h3>
                        <span>{user.role}</span>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <label className="flex items-center gap-1"><Mail size={12}/> Email</label>
                        <p style={{fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{user.email}</p>
                    </div>
                    <div className="info-item">
                        <label className="flex items-center gap-1"><Smartphone size={12}/> Mobile</label>
                        <p>{user.mobile_number || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                        <label className="flex items-center gap-1"><User size={12}/> Age</label>
                        <p>{user.age || 'N/A'} Years</p>
                    </div>
                    <div className="info-item">
                        <label className="flex items-center gap-1"><Briefcase size={12}/> Profession</label>
                        <p>{user.profession || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                        <label className="flex items-center gap-1"><DollarSign size={12}/> Income Range</label>
                        <p>{user.income_range || 'N/A'}</p>
                    </div>
                     <div className="info-item">
                        <label className="flex items-center gap-1"><Calendar size={12}/> Joined</label>
                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                                <DollarSign size={20} />
                             </div>
                             <div>
                                 <p className="font-bold text-sm">Monthly Limit</p>
                                 <p className="text-xs text-gray-500">Reset on 1st</p>
                             </div>
                        </div>
                        <span className="font-bold text-lg">$50,000</span>
                    </div>
                </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;