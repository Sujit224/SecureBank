import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import API from '../../api/axios';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === 'income')?.value || 0;
    const spending = payload.find(p => p.dataKey === 'spending')?.value || 0;
    const cashFlow = payload[0].payload.cash_flow;

    return (
      <div style={{ backgroundColor: '#fff', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', minWidth: '180px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#555' }}>Income</span>
          <span style={{ fontWeight: '500' }}>₹{income.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: '#555' }}>Spending</span>
          <span style={{ fontWeight: '500' }}>₹{spending.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', margin: '0 -16px 12px -16px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#333' }}>Cash Flow</span>
          <span style={{ fontWeight: '500' }}>
            ₹{cashFlow.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTick = (props) => {
  const { x, y, payload, chartData } = props;
  const monthName = payload.value.split(' ')[0]; // Gets 'June' from 'June 2026'
  const matchingData = chartData?.find(d => d.month === payload.value);
  const cashFlow = matchingData ? `₹${matchingData.cash_flow.toLocaleString('en-IN')}` : '';

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#333" fontSize="13px" fontWeight="600">
        {monthName}
      </text>
      <text x={0} y={0} dy={36} textAnchor="middle" fill="#666" fontSize="13px">
        {cashFlow}
      </text>
    </g>
  );
};

const CashFlowChart = ({ accountNumber }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch last 4 months to match the mock-up's concise view
        const res = await API.get(`/${accountNumber}/analytics/cash-flow?months_back=4`);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching cash flow data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (accountNumber) fetchData();
  }, [accountNumber]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );
  
  if (!data || data.length === 0) return null;

  return (
    <div style={{ padding: '30px 20px', backgroundColor: '#f5f5f5', borderRadius: '12px', marginTop: '30px' }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            tickLine={false} 
            axisLine={{ stroke: '#333', strokeWidth: 2 }} 
            tick={<CustomTick chartData={data} />} 
          />
          <YAxis 
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888', fontSize: 12 }} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="income" fill="#65b736" radius={[2, 2, 0, 0]} barSize={40} />
          <Bar dataKey="spending" fill="#313131" radius={[2, 2, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
