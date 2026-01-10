import React, { useState, useEffect } from 'react';
import { Home, User, CreditCard, Send, Shield, MessageCircle, LogOut, Menu, X, AlertTriangle, CheckCircle, Moon, Sun } from 'lucide-react';
import { styles } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// ============================================================================
// HELPER COMPONENT: WELCOME TOAST
// ============================================================================
const WelcomeToast = ({ name, onClose }) => (
  <div style={{
    position: 'fixed',
    top: '80px', // Below the header/toggle
    right: '20px',
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: 110,
    minWidth: '300px'
  }}>
    <div style={{ background: 'rgba(102, 126, 234, 0.1)', borderRadius: '50%', padding: '8px', display: 'flex' }}>
      <CheckCircle size={20} color="var(--primary)" />
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>Login Successful</h4>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Welcome back to SecureBank, {name}!</p>
    </div>
    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
      <X size={16} color="var(--text-secondary)" />
    </button>
  </div>
);

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================
const Sidebar = ({ activeView, setActiveView, role, isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const userMenuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'transactions', label: 'History', icon: CreditCard },
    { id: 'transfer', label: 'Transfer', icon: Send }
  ];

  const adminMenuItems = [
    { id: 'fraud', label: 'Fraud Alerts', icon: AlertTriangle },
    { id: 'users', label: 'User Management', icon: User }
  ];

  const menuItems = role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <>
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          className="lg:hidden"
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={styles.sidebarHeader}>
          <div style={{ ...styles.iconWrapper, marginBottom: 0, padding: '8px' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>SecureBank</h2>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              {role === 'admin' ? 'Admin Panel' : 'Personal Banking'}
            </p>
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  toggleSidebar();
                }}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
              >
                <Icon size={20} />
                <span style={{ fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={() => setActiveView('chatbot')}
            style={{ ...styles.navItem, ...(activeView === 'chatbot' ? styles.navItemActive : {}) }}
          >
            <MessageCircle size={20} />
            <span>AI Assistant</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Soon</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userProfile}>
            <div style={styles.avatar}><User size={20} color="var(--primary)" /></div>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user?.full_name}</p>
              <p style={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} style={styles.btnLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// VIEWS
// ============================================================================

const UserHome = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  useEffect(() => { apiService.getBalance().then(setBalance); }, []);

  // Get the first name for a friendlier greeting
  const firstName = user?.full_name.split(' ')[0] || 'User';

  return (
    <div>
      {/* 👋 PERSONALIZED WELCOME MESSAGE */}
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px' }}>
        Welcome back, {firstName}!
      </h1>
      
      <div style={styles.gradientCard}>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0' }}>Available Balance</p>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
          ${balance ? balance.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '---'}
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Account: {user?.account_number}</p>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
         <div style={styles.card}>
            <CreditCard size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Quick Transfer</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Send money instantly</p>
         </div>
         <div style={styles.card}>
            <User size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Profile Settings</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Update your details</p>
         </div>
         <div style={styles.card}>
            <MessageCircle size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Support</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Talk to AI Assistant</p>
         </div>
      </div>
    </div>
  );
};

const UserTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => { apiService.getTransactions().then(setTransactions); }, []);
    
    return (
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px' }}>History</h1>
            <div style={{ ...styles.card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Counterparty Acc</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Amount</th>
                            <th style={{ ...styles.th, textAlign: 'right' }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn) => (
                            <tr key={txn.id}>
                                <td style={styles.td}>{txn.date}</td>
                                <td style={styles.td}>{txn.description}</td>
                                <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '13px' }}>{txn.account_number}</td>
                                <td style={styles.td}><span style={styles.badgeSuccess}>{txn.status}</span></td>
                                <td style={{ ...styles.td, fontWeight: '600', color: txn.type === 'credit' ? '#48bb78' : '#e53e3e' }}>
                                    {txn.type === 'credit' ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                    ${txn.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const UserTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    await apiService.transferFunds();
    setLoading(false);
    setStatus('success');
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px' }}>Transfer Funds</h1>
      {status === 'success' && (
        <div style={{ ...styles.card, background: 'rgba(72, 187, 120, 0.1)', border: '1px solid #48bb78', color: '#2f855a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} />
            <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>Transfer Successful</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>Your funds have been sent securely.</p>
            </div>
          </div>
        </div>
      )}
      <div style={styles.card}>
        <form onSubmit={handleTransfer}>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Recipient Account Number</label>
            <input style={styles.input} placeholder="ACC..." required />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Amount ($)</label>
            <input style={styles.input} type="number" placeholder="0.00" min="0.01" step="0.01" required />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, resize: 'vertical' }} rows={3} placeholder="What is this for?" />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Processing...' : 'Send Money'}</button>
        </form>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => { apiService.getUserProfile().then(setProfile); }, []);
  if (!profile) return <div style={{ padding: '20px', color: 'var(--text-main)' }}>Loading Profile...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px' }}>Your Profile</h1>
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-app)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={40} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>{profile.full_name}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '16px' }}>{profile.email}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <div><label style={styles.label}>Account Number</label><p style={{ fontFamily: 'monospace', fontSize: '16px', color: 'var(--text-main)', marginTop: '4px' }}>{profile.account_number}</p></div>
          <div><label style={styles.label}>Account Type</label><p style={{ fontSize: '16px', color: 'var(--text-main)', marginTop: '4px' }}>{profile.account_type}</p></div>
          <div><label style={styles.label}>Phone</label><p style={{ fontSize: '16px', color: 'var(--text-main)', marginTop: '4px' }}>{profile.phone}</p></div>
        </div>
      </div>
    </div>
  );
};

const AdminFraudAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { apiService.getFraudAlerts().then(setAlerts); }, []);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px' }}>Fraud Monitoring</h1>
      <div style={styles.grid}>
        {alerts.map((alert) => (
          <div key={alert.id} style={styles.card}>
            <div style={styles.sidebarHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><AlertTriangle color="#e53e3e" /><span style={{ fontWeight: 'bold', color: '#e53e3e' }}>High Risk Detected</span></div>
              <span style={styles.badge}>{new Date(alert.timestamp).toLocaleDateString()}</span>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-main)' }}>Transaction #{alert.transaction_id}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Reason: {alert.reason}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div><label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Amount</label><span style={{ fontWeight: '500', color: 'var(--text-main)' }}>${alert.amount.toLocaleString()}</span></div>
              <div><label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Risk Score</label><span style={{ fontWeight: 'bold', color: '#e53e3e' }}>{(alert.risk_score * 100).toFixed(0)}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminUserManagement = () => (
  <div><h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px' }}>User Management</h1><div style={styles.card}><p style={{color: 'var(--text-main)'}}>Module under construction.</p></div></div>
);

// ============================================================================
// MAIN DASHBOARD LAYOUT
// ============================================================================
const Dashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(user?.role === 'admin' ? 'fraud' : 'home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // 👋 WELCOME TOAST STATE
  const [showWelcome, setShowWelcome] = useState(false);

  // Trigger Welcome Toast on Mount
  useEffect(() => {
    setShowWelcome(true);
    const timer = setTimeout(() => setShowWelcome(false), 3000); // Auto-hide after 3s
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 1024 && setSidebarOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    if (user?.role === 'admin') {
      switch (activeView) {
        case 'fraud': return <AdminFraudAlerts />;
        case 'users': return <AdminUserManagement />;
        default: return <AdminFraudAlerts />;
      }
    } else {
      switch (activeView) {
        case 'home': return <UserHome />;
        case 'profile': return <UserProfile />;
        case 'transactions': return <UserTransactions />;
        case 'transfer': return <UserTransfer />;
        default: return <UserHome />;
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Toast Notification */}
      {showWelcome && (
        <WelcomeToast 
          name={user?.full_name?.split(' ')[0] || 'User'} 
          onClose={() => setShowWelcome(false)} 
        />
      )}

      {/* Mobile Sidebar Toggle */}
      <button 
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Floating Theme Toggle (Top Right) */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
        title="Toggle Dark Mode"
      >
        {isDark ? <Sun size={20} color="#ecc94b" /> : <Moon size={20} color="var(--text-main)" />}
      </button>

      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        role={user?.role}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
      />
      
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;