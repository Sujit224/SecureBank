import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <a href="#" className="nav-link">Home</a>
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
          <Link to="/login" className="signin-btn">
            Sign In
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <a href="#" className="mobile-link">Home</a>
          <a href="#" className="mobile-link">Learn</a>
          <a href="#" className="mobile-link">Help</a>
          <a href="#" className="mobile-link">Blog</a>
          <a href="#" className="mobile-link">About</a>
          <div style={{ height: '1px', backgroundColor: 'var(--color-gray)', margin: '8px 0' }}></div>
          <Link to="/login" className="mobile-signin">
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
