import React, { useState } from 'react';
import API from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use the context we made!
import Navbar from '../components/landing/Navbar';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from Context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // 1. Prepare form data for OAuth2 (FastAPI expects x-www-form-urlencoded)
      const params = new URLSearchParams();
      params.append('username', form.username);
      params.append('password', form.password);

      // 2. Call API
      const res = await API.post('/auth/login', params);
      
      // 3. Use Context to log in (Updates State globally)
      login(res.data.access_token);
      
      // 4. Navigate based on role (We will decode in Context, but for now just go to dashboard)
      navigate('/user-dashboard'); 
      
    } catch (err) {
      setError("Invalid Username or Password");
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to manage your finances.</p>
          
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* USERNAME FIELD */}
            <div className="input-group">
              <label className="input-label">Username</label>
              <input 
                className="input-field" 
                placeholder="Enter your username" 
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})} 
                required
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                className="input-field" 
                type="password" 
                placeholder="••••••••" 
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} 
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Secure Log In
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '0.9rem', color: '#666' }}>
            New to NovaBank? <a href="/signup" style={{ color: 'black', fontWeight: 'bold' }}>Create an account</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;