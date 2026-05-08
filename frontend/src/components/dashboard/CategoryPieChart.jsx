import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../api/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF5A', '#A1A1A1'];

const CategoryPieChart = ({ accountNumber, isProfile = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthsBack, setMonthsBack] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = isProfile 
            ? `/profile/analytics/categories?months_back=${monthsBack}` 
            : `/${accountNumber}/analytics/categories?months_back=${monthsBack}`;
            
        const res = await API.get(endpoint);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching category analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isProfile || accountNumber) {
        fetchData();
    }
  }, [accountNumber, isProfile, monthsBack]);

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      );
    }
    
    if (!data || data.length === 0) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#666' }}>No expense data available for this period.</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="amount"
            nameKey="category"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ padding: '30px 20px', backgroundColor: '#f5f5f5', borderRadius: '12px', marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: '600', color: '#333', margin: 0 }}>
          Expense Analysis
        </h3>
        <select 
          value={monthsBack} 
          onChange={(e) => setMonthsBack(Number(e.target.value))}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
        >
          <option value={1}>This Month</option>
          <option value={3}>Last 3 Months</option>
          <option value={6}>Last 6 Months</option>
          <option value={12}>This Year</option>
        </select>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default CategoryPieChart;
