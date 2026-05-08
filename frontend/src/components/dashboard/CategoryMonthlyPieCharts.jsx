import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import API from '../../api/axios';
import ReportGenerator from './ReportGenerator';

const COLORS = {
  'Shopping': '#6366f1',
  'Food & Dining': '#10b981',
  'Recreation': '#f59e0b',
  'Transport': '#ec4899',
  'Bills & Utilities': '#8b5cf6',
  'Daily Expense': '#ef4444',
  'Others': '#94a3b8'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ 
        backgroundColor: 'var(--color-bg-tertiary)', 
        padding: '12px', 
        border: '1px solid var(--color-border)', 
        borderRadius: '12px', 
        boxShadow: '0 10px 20px var(--color-shadow)',
        color: 'var(--color-text-primary)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>{data.category}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '140px', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Amount:</span>
          <span style={{ fontWeight: '600' }}>₹{payload[0].value.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryMonthlyPieCharts = ({ accountNumber, isProfile = false, username }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = isProfile 
            ? `/profile/analytics/categories/monthly?months_back=3` 
            : `/${accountNumber}/analytics/categories/monthly?months_back=3`;
            
        const res = await API.get(endpoint);
        setMonthlyData(res.data.monthly_data);
      } catch (err) {
        console.error("Error fetching monthly category analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isProfile || accountNumber) {
        fetchData();
    }
  }, [accountNumber, isProfile]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>No expense data available for this period.</p>
        </div>
      );
  }

  return (
    <div className="animate-fade" style={{ marginTop: '20px' }}>
      <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>
        Monthly Spending Insights
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {[...monthlyData].reverse().map((monthRecord, index) => {
          const isCurrentMonth = index === 0;
          
          return (
          <div key={index} className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '20px', color: 'var(--color-text-primary)' }}>
                {monthRecord.month}
              </h4>
              {isCurrentMonth && (
                <span style={{ 
                  backgroundColor: 'var(--color-accent)', 
                  color: '#000', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  Current Period
                </span>
              )}
            </div>
            
            {monthRecord.data.length === 0 ? (
               <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px' }}>
                 No transactions recorded for this month.
               </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: '1 1 300px', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                            data={monthRecord.data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="category"
                        >
                          {monthRecord.data.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[entry.category] || COLORS['Others']} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div style={{ flex: '1 1 250px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <tbody>
                        {[...monthRecord.data].sort((a,b) => b.amount - a.amount).slice(0, 5).map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[item.category] || COLORS['Others'] }}></div>
                              <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>{item.category}</span>
                            </td>
                            <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            )}

            {isCurrentMonth && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '32px', marginTop: '24px' }}>
                <ReportGenerator
                  accountNumber={accountNumber}
                  isProfile={isProfile}
                  username={username}
                />
              </div>
            )}
          </div>
        )})}  
      </div>
    </div>
  );
};

export default CategoryMonthlyPieCharts;
