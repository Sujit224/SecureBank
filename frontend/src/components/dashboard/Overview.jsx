import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import CashFlowChart from './CashFlowChart';

const Overview = ({ user, account }) => {
  const [showBalance, setShowBalance] = useState(false);

  if (!user || !account) return null;

  return (
    <div className="dashboard-overview animate-fade">
      <h2 className="section-title">Overview</h2>
      
      {/* Balance Card */}
      <div className="glass-card balance-card">
          <div className="absolute top-0 right-0 p-5 opacity-10">
              <TrendingUp size={120} color="#fff" /> 
          </div>
          
          <div>
              <div className="balance-label-row">
                <p className="balance-label">Available Balance</p>
                <button
                  className="balance-eye-btn"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <h2 className="balance-amount">
                {showBalance
                  ? `₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : '₹ ••••••'}
              </h2>
          </div>
          
          <div className="card-details">
            <div>
                <p className="balance-label">Account Holder</p>
                <p className="font-medium text-lg">{user.username}</p>
            </div>
            <div className="text-right">
                <p className="balance-label">{account.account_type} Account</p>
                <p className="highlight-text">{account.account_number}</p>
            </div>
          </div>
      </div>

      <div className="stats-grid">
         <div className="stat-card">
            <div className="stat-icon income">
               <ArrowUpRight size={24} />
            </div>
            <div>
               <p className="stat-label">Income</p>
               <p className="stat-value">{user.income_range}</p>
            </div>
         </div>
         
         <div className="stat-card">
            <div className="stat-icon joined">
               <Calendar size={24} />
            </div>
            <div>
               <p className="stat-label">Account Open Date</p>
               <p className="stat-value">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
         </div>

         <div className="stat-card">
            <div className="stat-icon limit">
               <DollarSign size={24} />
            </div>
            <div>
               <p className="stat-label">Monthly Limit</p>
               <p className="stat-value">₹50,000</p>
            </div>
         </div>
      </div>
      
      <CashFlowChart accountNumber={account.account_number} />
    </div>
  );
};

export default Overview;
