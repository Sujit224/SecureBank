import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import API from '../../api/axios';

const COLORS = {
  'Shopping': '#0088FE',
  'Food & Dining': '#00C49F',
  'Recreation': '#FFBB28',
  'Transport': '#FF8042',
  'Bills & Utilities': '#AF19FF',
  'Daily Expense': '#FF19A3',
  'Others': '#A1A1A1'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '120px' }}>
          <span style={{ color: payload[0].fill }}>Amount:</span>
          <span style={{ fontWeight: '500' }}>₹{payload[0].value.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryBarCharts = ({ accountNumber, isProfile = false }) => {
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
        <div style={{ padding: '30px 20px', backgroundColor: '#f5f5f5', borderRadius: '12px', marginTop: '30px', textAlign: 'center' }}>
            No expense data available for this period.
        </div>
      );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '20px', fontWeight: '600', color: '#333', textAlign: 'center' }}>
        Monthly Category Analysis
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {monthlyData.map((monthRecord, index) => (
          <div key={index} style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '15px', color: '#444', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              {monthRecord.month}
            </h4>
            
            {monthRecord.data.length === 0 ? (
               <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No expenses this month.</p>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthRecord.data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fill: '#666', fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={{ stroke: '#ccc' }}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value}`} 
                      tick={{ fill: '#888', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {monthRecord.data.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[entry.category] || COLORS['Others']} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBarCharts;
