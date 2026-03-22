import React, { useState } from 'react';
import { Search, Menu, X, User } from 'lucide-react'; // Added User icon
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth(); // Get user and logout from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <div className="logo-dot-1"></div>
            <div className="logo-dot-2"></div>
          </div>
          <span className="logo-text">SecureBank</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <a href="#" className="nav-link">Learn</a>
          <a href="#" className="nav-link">Help</a>
          <a href="#" className="nav-link">Blog</a>
          <a href="#" className="nav-link">About</a>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <button className="search-btn">
            <Search size={20} />
          </button>
          
          {user ? (
            <div className="nav-auth">
               <Link to="/accounts" className="nav-link" style={{ fontWeight: '600' }}>
                 Dashboard
               </Link>
               <button onClick={handleLogout} className="signin-btn" style={{ backgroundColor: 'transparent', color: 'var(--color-text)', border: 'none', padding: '0' }}>
                 Logout
               </button>
               <div className="user-avatar">
                  <User size={18} />
               </div>
            </div>
          ) : (
            <Link to="/login" className="signin-btn">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          <a href="#" className="mobile-link">Learn</a>
          <a href="#" className="mobile-link">Help</a>
          <a href="#" className="mobile-link">Blog</a>
          <a href="#" className="mobile-link">About</a>
          <div style={{ height: '1px', backgroundColor: 'var(--color-gray)', margin: '8px 0' }}></div>
          
          {user ? (
            <>
              <Link to="/accounts" className="mobile-link">Dashboard</Link>
              <button onClick={handleLogout} className="mobile-signin" style={{ marginTop: '10px' }}>
                Logout
              </button>
            </>
          ) : (
             <Link to="/login" className="mobile-signin">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
