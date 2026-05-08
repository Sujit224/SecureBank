import { LayoutDashboard, Send, User, LogOut, Home, Wallet, History, CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'deposit', label: 'Deposit', icon: <Wallet size={20} /> },
    { id: 'transfer', label: 'Transfer Funds', icon: <Send size={20} /> },
    { id: 'history', label: 'Transaction History', icon: <History size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
         <div className="logo-icon-small">
            <div className="dot-1"></div>
            <div className="dot-2"></div>
         </div>
         <span className="sidebar-logo-text">SecureBank</span>
      </div>

      <div className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button onClick={() => navigate('/accounts')} className="sidebar-item mb-2">
          <CreditCard size={20} />
          <span>My Accounts</span>
        </button>

        <button onClick={() => navigate('/')} className="sidebar-item mb-2">
          <Home size={20} />
          <span>Back to Home</span>
        </button>

        <button onClick={handleLogout} className="sidebar-item logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
