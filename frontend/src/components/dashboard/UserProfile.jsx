import React from 'react';
import { User, Mail, Smartphone, Briefcase, Calendar, DollarSign, Shield } from 'lucide-react';

const UserProfile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="profile-section animate-fade">
      <h2 className="section-title">My Profile</h2>

      <div className="profile-large-card glass-card">
        <div className="profile-banner"></div>
        <div className="profile-content-wrapper">
             <div className="profile-avatar-large">
                {user.username.charAt(0).toUpperCase()}
             </div>
             
             <div className="profile-text-header">
                <h3>{user.username}</h3>
                <span className="role-badge">{user.role}</span>
             </div>

             <div className="profile-details-grid">
                <div className="detail-item">
                    <label><Mail size={14}/> Email Address</label>
                    <p>{user.email}</p>
                </div>
                <div className="detail-item">
                    <label><Smartphone size={14}/> Mobile Number</label>
                    <p>{user.mobile_number}</p>
                </div>
                <div className="detail-item">
                    <label><User size={14}/> Age</label>
                    <p>{user.age} Years</p>
                </div>
                <div className="detail-item">
                    <label><Briefcase size={14}/> Profession</label>
                    <p>{user.profession}</p>
                </div>
                <div className="detail-item">
                    <label><DollarSign size={14}/> Annual Income</label>
                    <p>{user.income_range}</p>
                </div>
                <div className="detail-item">
                    <label><Calendar size={14}/> Member Since</label>
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                    <label><Shield size={14}/> Marital Status</label>
                    <p>{user.marital_status}</p>
                </div>
                 <div className="detail-item">
                    <label><User size={14}/> Gender</label>
                    <p>{user.gender}</p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
