import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { CreditCard, Mail, Smartphone, Briefcase, LogOut, Home, ChevronRight, Wallet, Plus, User, Calendar, DollarSign, Shield, Eye, EyeOff, Hash } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import InvestmentAdvisor from '../components/dashboard/InvestmentAdvisor';
import './AccountSelector.css';

const AccountSelector = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [creating, setCreating] = useState(false);
  const [visibleBalances, setVisibleBalances] = useState(new Set());
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchUser = async () => {
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
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAccountClick = (accountNumber) => {
    navigate(`/user-dashboard/${accountNumber}`);
  };

  const handleCreateAccount = async (accountType) => {
    setCreating(true);
    try {
      await API.post('/users/me/accounts', { account_type: accountType });
      setShowNewAccount(false);
      await fetchUser(); // Refresh to show new account
    } catch (err) {
      console.error("Failed to create account", err);
      alert(err.response?.data?.detail || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="accounts-loading">
        <div className="accounts-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="accounts-page">
      {/* Top Navigation Bar */}
      <nav className="accounts-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo-icon">
            <div className="dot-1"></div>
            <div className="dot-2"></div>
          </div>
          <span className="topbar-logo-text">SecureBank</span>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate('/')} className="topbar-btn">
            <Home size={18} />
            <span>Home</span>
          </button>
          <button onClick={handleLogout} className="topbar-btn topbar-btn-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Profile + Accounts */}
      <div className="accounts-container">
        {/* Full Profile Card */}
        <div className="profile-hero animate-fade">
          <div className="profile-hero-top">
            <div className="profile-hero-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">{user.username}</h1>
              <p className="profile-hero-email">{user.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="profile-hero-role">{user.role}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>•</span>
                <span style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '0.8rem', 
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  letterSpacing: '1px'
                }}>SB-{String(user.user_id).padStart(4, '0')}</span>
              </div>
            </div>
          </div>

          <div className="profile-hero-grid">
            <div className="profile-detail-item">
              <label><Mail size={14} /> Email Address</label>
              <p>{user.email}</p>
            </div>
            <div className="profile-detail-item">
              <label><Smartphone size={14} /> Mobile Number</label>
              <p>{user.mobile_number}</p>
            </div>
            <div className="profile-detail-item">
              <label><User size={14} /> Age</label>
              <p>{user.age} Years</p>
            </div>
            <div className="profile-detail-item">
              <label><Briefcase size={14} /> Profession</label>
              <p>{user.profession}</p>
            </div>
            <div className="profile-detail-item">
              <label><DollarSign size={14} /> Annual Income</label>
              <p>{user.income_range}</p>
            </div>
            <div className="profile-detail-item">
              <label><Calendar size={14} /> Member Since</label>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="profile-detail-item">
              <label><Shield size={14} /> Marital Status</label>
              <p>{user.marital_status}</p>
            </div>
            <div className="profile-detail-item">
              <label><User size={14} /> Gender</label>
              <p>{user.gender}</p>
            </div>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="accounts-section animate-fade">
          <div className="accounts-section-header">
            <h2 className="accounts-section-title">Your Accounts</h2>
            <p className="accounts-section-subtitle">
              Select an account to view dashboard, make deposits, transfers, and more.
            </p>
          </div>

          <div className="accounts-grid">
            {user.accounts && user.accounts.map((account) => (
              <div
                key={account.account_id}
                className="account-card"
                onClick={() => handleAccountClick(account.account_number)}
              >
                <div className="account-card-top">
                  <div className="account-card-icon">
                    <CreditCard size={24} />
                  </div>
                  <ChevronRight size={20} className="account-card-arrow" />
                </div>

                <div className="account-card-type">{account.account_type} Account</div>
                <div className="account-card-number">{account.account_number}</div>

                <div className="account-card-balance-section">
                  <div className="balance-row">
                    <span className="account-card-balance-label">Available Balance</span>
                    <button
                      className="balance-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisibleBalances(prev => {
                          const next = new Set(prev);
                          if (next.has(account.account_id)) {
                            next.delete(account.account_id);
                          } else {
                            next.add(account.account_id);
                          }
                          return next;
                        });
                      }}
                    >
                      {visibleBalances.has(account.account_id) ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="account-card-balance">
                    {visibleBalances.has(account.account_id)
                      ? `₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : '₹ ••••••'}
                  </span>
                </div>

                <div className="account-card-footer">
                  <span className="account-card-date">
                    Opened {new Date(account.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* New Account Card */}
            {!showNewAccount ? (
              <div className="account-card new-account-card" onClick={() => setShowNewAccount(true)}>
                <div className="new-account-content">
                  <Plus size={40} />
                  <h3>Open New Account</h3>
                  <p>Create a Savings or Current account</p>
                </div>
              </div>
            ) : (
              <div className="account-card new-account-form-card">
                <h3 className="new-account-form-title">Choose Account Type</h3>
                <div className="new-account-options">
                  <button
                    className="new-account-option"
                    onClick={() => handleCreateAccount('Savings')}
                    disabled={creating}
                  >
                    <Wallet size={24} />
                    <span>Savings</span>
                  </button>
                  <button
                    className="new-account-option"
                    onClick={() => handleCreateAccount('Current')}
                    disabled={creating}
                  >
                    <Briefcase size={24} />
                    <span>Current</span>
                  </button>
                </div>
                {creating && <p className="creating-text">Creating account...</p>}
                <button className="new-account-cancel" onClick={() => setShowNewAccount(false)} disabled={creating}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Investment Advisor Section */}
        <div style={{ marginTop: '48px', marginBottom: '60px' }}>
          <InvestmentAdvisor />
        </div>
      </div>
      {/* ChatBot Widget */}
      <ChatBot />
    </div>
  );
};

export default AccountSelector;
