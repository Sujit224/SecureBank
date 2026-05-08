import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import TransferForm from '../components/dashboard/TransferForm';
import DepositForm from '../components/dashboard/DepositForm';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import CategoryMonthlyPieCharts from '../components/dashboard/CategoryMonthlyPieCharts';

import ChatBot from '../components/ChatBot';
import './Dashboard.css';

const UserDashboard = () => {
  const { accountNumber } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const res = await API.get('/users/me');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  // Find the selected account from the user's accounts list
  const selectedAccount = user?.accounts?.find(acc => acc.account_number === accountNumber);

  // If account not found, redirect to accounts page
  if (user && !selectedAccount) {
    navigate('/accounts');
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Dynamic Header */}
        <div className="page-header">
           <h1 className="page-title">
             {activeTab === 'dashboard' && `Welcome back, ${user?.username}`}
             {activeTab === 'deposit' && 'Deposit Funds'}
             {activeTab === 'transfer' && 'Transfer Funds'}
             {activeTab === 'history' && 'Transaction History'}
             {activeTab === 'analytics' && 'Cash Flow Analytics'}
           </h1>
           <p className="page-subtitle">
             {activeTab === 'dashboard' && 'Here is what’s happening with your account today.'}
             {activeTab === 'deposit' && 'Add funds to your account securely.'}
             {activeTab === 'transfer' && 'Securely send money to friends and family.'}
             {activeTab === 'history' && 'View your past transactions.'}
             {activeTab === 'analytics' && 'Monitor your income and spending behaviour.'}
           </p>
        </div>

        {/* Content Views */}
        {activeTab === 'dashboard' && <Overview user={user} account={selectedAccount} />}
        {activeTab === 'deposit' && <DepositForm accountNumber={accountNumber} onDepositSuccess={fetchUserData} />}
        {activeTab === 'transfer' && <TransferForm accountNumber={accountNumber} onTransferSuccess={fetchUserData} />}
        {activeTab === 'history' && <TransactionHistory accountNumber={accountNumber} />}
        {activeTab === 'analytics' && (
          <div className="dashboard-overview animate-fade" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
             <CashFlowChart accountNumber={accountNumber} />
             <CategoryMonthlyPieCharts accountNumber={accountNumber} username={user?.username} />
          </div>
        )}
      </div>

      {/* ChatBot Widget */}
      <ChatBot />
    </div>
  );
};

export default UserDashboard;