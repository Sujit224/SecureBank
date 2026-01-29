import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/dashboard/Sidebar';
import Overview from '../components/dashboard/Overview';
import TransferForm from '../components/dashboard/TransferForm';
import UserProfile from '../components/dashboard/UserProfile';
import ChatBot from '../components/ChatBot';
import './Dashboard.css';

const UserDashboard = () => {
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
             {activeTab === 'transfer' && 'Transfer Funds'}
             {activeTab === 'profile' && 'Your Profile'}
           </h1>
           <p className="page-subtitle">
             {activeTab === 'dashboard' && 'Here is what’s happening with your account today.'}
             {activeTab === 'transfer' && 'Securely send money to friends and family.'}
             {activeTab === 'profile' && 'Manage your personal information and settings.'}
           </p>
        </div>

        {/* Content Views */}
        {activeTab === 'dashboard' && <Overview user={user} />}
        {activeTab === 'transfer' && <TransferForm onTransferSuccess={fetchUserData} />}
        {activeTab === 'profile' && <UserProfile user={user} />}
      </div>

      {/* ChatBot Widget */}
      <ChatBot />
    </div>
  );
};

export default UserDashboard;