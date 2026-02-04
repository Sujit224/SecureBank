import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { AlertTriangle } from 'lucide-react';
import './Dashboard.css'; 

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/transactions/admin/dashboard').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="text-center pt-20">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="container dashboard-page animate-fade">
        <h1 className="dashboard-title">Security Center</h1>

        {/* Stats Row */}
        <div className="dashboard-grid" style={{ marginBottom: '40px', gridTemplateColumns: '1fr 1fr 1fr' }}>
           <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
             <p className="balance-label">Total Users</p>
             <h2>{data.metrics.total_users}</h2>
           </div>
           <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
             <p className="balance-label">Transactions</p>
             <h2>{data.metrics.total_transactions}</h2>
           </div>
           <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderColor: 'var(--accent-purple)' }}>
             <p className="balance-label" style={{ color: '#fca5a5' }}>Fraud Blocked</p>
             <h2 style={{ color: '#fca5a5' }}>{data.metrics.fraud_cases_caught}</h2>
           </div>
        </div>

        {/* Fraud Logs Table */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle color="red" /> Recent Suspicious Activity
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-muted)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Sender</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_fraud_logs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '15px 10px' }}>{log.sender}</td>
                  <td style={{ color: 'white' }}>₹{log.amount}</td>
                  <td style={{ color: '#fca5a5' }}>BLOCKED</td>
                  <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;