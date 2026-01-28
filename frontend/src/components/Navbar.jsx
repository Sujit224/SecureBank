import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth(); // Use Context!
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', height: '80px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
      zIndex: 1000
    }}>
      {/* Logo */}
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px', color: 'black', textDecoration: 'none' }}>
        NOVA<span style={{ color: '#ccf600', backgroundColor: 'black', padding: '0 4px' }}>BANK</span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {!user ? (
          <>
            <Link to="/login" style={{ color: 'black', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              Sign Up
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;