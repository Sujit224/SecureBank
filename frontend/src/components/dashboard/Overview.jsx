import React from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Overview = ({ user }) => {
  if (!user) return null;

  return (
    <div className="dashboard-overview animate-fade">
      <h2 className="section-title">Overview</h2>
      
      {/* Balance Card */}
      <div className="glass-card balance-card mb-8">
          <div className="absolute top-0 right-0 p-5 opacity-10">
              <TrendingUp size={120} color="#fff" /> 
          </div>
          
          <div>
              <p className="balance-label">Total Balance</p>
              <h2 className="balance-amount">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          </div>
          
          <div className="card-details">
            <div>
                <p className="balance-label">Account Holder</p>
                <p className="font-medium text-lg">{user.username}</p>
            </div>
            <div className="text-right">
                <p className="balance-label">Account No.</p>
                <p className="highlight-text">{user.account_number}</p>
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
               <p className="stat-label">Joined</p>
               <p className="stat-value">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
         </div>

         <div className="stat-card">
            <div className="stat-icon limit">
               <DollarSign size={24} />
            </div>
            <div>
               <p className="stat-label">Monthly Limit</p>
               <p className="stat-value">$50,000</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Overview;
