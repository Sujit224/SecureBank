import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar'; // Correct Navbar path
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '',
    mobile_number: '', 
    age: '', 
    profession: '',
    gender: 'Male', 
    marital_status: 'Single', // Default value
    dob: '', 
    income_range: '0-5 LPA',
    role: 'user'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', formData);
      // Optional: You might want to show a modal instead of alert
      alert(`Welcome! Your Account Number is: ${res.data.account_number}`);
      navigate('/login');
    } catch (error) {
      alert("Error: " + (error.response?.data?.detail || "Signup Failed"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-page">
        <div className="signup-card">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join the future of banking today.</p>
          
          <form onSubmit={handleSubmit} className="signup-form">
            
            {/* Section 1: Identity */}
            <div className="form-section-title">Identity Details</div>
            
            <div className="input-group">
                <label>Username</label>
                <input name="username" className="input-field" placeholder="Choose a username" onChange={handleChange} required />
            </div>

            <div className="input-group">
                <label>Email</label>
                <input name="email" type="email" className="input-field" placeholder="email@example.com" onChange={handleChange} required />
            </div>
            
            <div className="input-group">
                <label>Password</label>
                <input name="password" type="password" className="input-field" placeholder="Create a strong password" onChange={handleChange} required />
            </div>

            <div className="input-group">
                <label>Mobile Number</label>
                <input name="mobile_number" className="input-field" placeholder="10-digit number" onChange={handleChange} required />
            </div>

            {/* Section 2: Personal Profile */}
            <div className="form-section-title">Personal Profile</div>
            
            <div className="input-group">
                <label>Age</label>
                <input name="age" type="number" className="input-field" placeholder="e.g. 25" onChange={handleChange} required />
            </div>

            <div className="input-group">
                <label>Profession</label>
                <input name="profession" className="input-field" placeholder="e.g. Engineer" onChange={handleChange} required />
            </div>
            
            <div className="input-group">
                <label>Gender</label>
                <select name="gender" className="input-field" onChange={handleChange} value={formData.gender}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="input-group">
                <label>Marital Status</label>
                <select name="marital_status" className="input-field" onChange={handleChange} value={formData.marital_status}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                </select>
            </div>

            <div className="input-group">
                <label>Income Range</label>
                <select name="income_range" className="input-field" onChange={handleChange} value={formData.income_range}>
                    <option value="0-5 LPA">0-5 LPA</option>
                    <option value="5-10 LPA">5-10 LPA</option>
                    <option value="10-20 LPA">10-20 LPA</option>
                    <option value="30+ LPA">30+ LPA</option>
                </select>
            </div>
            
            <div className="input-group">
                <label>Date of Birth</label>
                <input name="dob" type="date" className="input-field" onChange={handleChange} required />
            </div>

            <button type="submit" className="signup-btn">
              Complete Registration
            </button>
            
            <div className="full-width text-center" style={{ textAlign: 'center', marginTop: '10px' }}>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 'bold', color: '#000' }}>Sign In</Link>
                </p>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;