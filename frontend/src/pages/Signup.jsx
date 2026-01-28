import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    mobile_number: '', age: '', profession: '',
    gender: 'Male', marital_status: 'Single',
    dob: '', income_range: '0-5 LPA',
    role: 'user'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', formData);
      alert(`Welcome! Your Account Number is: ${res.data.account_number}`);
      navigate('/login');
    } catch (error) {
      alert("Error: " + (error.response?.data?.detail || "Signup Failed"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '800px' }}> {/* Wider for grid */}
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the future of banking today.</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
            
            {/* Section 1: Identity */}
            <div style={{ gridColumn: 'span 2' }}>
              <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '10px' }}>Identity</h4>
            </div>
            <input name="username" className="input-field" placeholder="Username" onChange={handleChange} required />
            <input name="email" type="email" className="input-field" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" className="input-field" placeholder="Password" onChange={handleChange} required />
            <input name="mobile_number" className="input-field" placeholder="Mobile Number" onChange={handleChange} required />

            {/* Section 2: Profile */}
            <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
              <h4 style={{ color: 'var(--accent-purple)', marginBottom: '10px' }}>Profile</h4>
            </div>
            <input name="age" type="number" className="input-field" placeholder="Age" onChange={handleChange} required />
            <input name="profession" className="input-field" placeholder="Profession" onChange={handleChange} required />
            
            <select name="gender" className="input-field" onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <select name="income_range" className="input-field" onChange={handleChange}>
              <option value="0-5 LPA">0-5 LPA</option>
              <option value="5-10 LPA">5-10 LPA</option>
              <option value="10-20 LPA">10-20 LPA</option>
              <option value="30+ LPA">30+ LPA</option>
            </select>
            
            <input name="dob" type="date" className="input-field" onChange={handleChange} style={{ gridColumn: 'span 2' }} required />

            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '16px' }}>
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;