import React, { useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import API from '../../api/axios';

const COLORS = {
  'Shopping': '#6366f1',
  'Food & Dining': '#10b981',
  'Recreation': '#f59e0b',
  'Transport': '#ef4444',
  'Bills & Utilities': '#8b5cf6',
  'Daily Expense': '#ec4899',
  'Others': '#94a3b8',
};

const GRADIENT_COLORS = ['#6366f1', '#10b981', '#f59e0b'];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ── The hidden printable report ──────────────────────────────────────────────
const PrintableReport = React.forwardRef(({ data, username }, ref) => {
  if (!data) return null;

  const { report_parsed, monthly_data, cash_flow, total_spending, total_income, generated_at, account } = data;

  // Build bar-chart dataset: total spending per month
  const barData = cash_flow.map(m => ({
    month: m.month,
    Income: Math.round(m.income),
    Spending: Math.round(m.spending),
  }));

  // Build line chart: net savings per month
  const lineData = cash_flow.map(m => ({
    month: m.month,
    'Net Savings': Math.round(m.income - m.spending),
  }));

  // Latest month category breakdown
  const latestMonth = [...monthly_data].reverse()[0];

  const summary = report_parsed?.summary || "Summary not available.";
  const analysis = report_parsed?.analysis || "Analysis not available.";
  const tipLines = report_parsed?.tips || [];

  return (
    <div ref={ref} style={{
      width: '794px',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      backgroundColor: '#fff',
      color: '#1e293b',
      padding: 0,
      margin: 0,
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
        padding: '40px 48px 32px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
              SecureBank
            </div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
              Financial Report
            </h1>
            <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: 14 }}>
              3-Month Spending Analysis · {account === 'profile' ? 'All Accounts' : `Account: ${account}`}
            </p>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.8, fontSize: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{username || 'Customer'}</div>
            <div>Generated: {generated_at}</div>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          {[
            { label: 'Total Income', value: fmt(total_income), color: '#6ee7b7' },
            { label: 'Total Spending', value: fmt(total_spending), color: '#fca5a5' },
            { label: 'Net Savings', value: fmt(total_income - total_spending), color: total_income - total_spending >= 0 ? '#6ee7b7' : '#fca5a5' },
          ].map(kpi => (
            <div key={kpi.label} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '16px 20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '32px 48px' }}>

        {/* AI Summary */}
        <Section title="📋 Summary" accent="#6366f1">
          <p style={{ lineHeight: 1.7, color: '#475569', margin: 0 }}>{summary}</p>
        </Section>

        {/* Bar Chart */}
        <Section title="📊 Income vs Spending — Monthly Comparison" accent="#10b981">
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 8, right: 16, left: 16, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spending" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Line Chart */}
        <Section title="📈 Net Savings Trend" accent="#f59e0b">
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Line
                  type="monotone"
                  dataKey="Net Savings"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Two columns: pie + category table */}
        {latestMonth && latestMonth.data.length > 0 && (
          <Section title={`🍕 Category Breakdown — ${latestMonth.month}`} accent="#ec4899">
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <div style={{ width: 260, flexShrink: 0 }}>
                <ResponsiveContainer width={260} height={200}>
                  <PieChart>
                    <Pie
                      data={latestMonth.data}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      dataKey="amount"
                      nameKey="category"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {latestMonth.data.map((entry, i) => (
                        <Cell key={i} fill={COLORS[entry.category] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category table */}
              <div style={{ flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Category</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Amount</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...latestMonth.data]
                      .sort((a, b) => b.amount - a.amount)
                      .map((cat, i) => {
                        const total = latestMonth.data.reduce((s, c) => s + c.amount, 0);
                        const pct = ((cat.amount / total) * 100).toFixed(1);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '9px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                display: 'inline-block',
                                width: 10, height: 10,
                                borderRadius: '50%',
                                background: COLORS[cat.category] || '#94a3b8',
                                flexShrink: 0,
                              }} />
                              {cat.category}
                            </td>
                            <td style={{ textAlign: 'right', padding: '9px 0', fontWeight: 600 }}>{fmt(cat.amount)}</td>
                            <td style={{ textAlign: 'right', padding: '9px 0', color: '#64748b' }}>{pct}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        )}

        {/* Month-over-Month Analysis */}
        <Section title="🔍 Month-over-Month Analysis" accent="#8b5cf6">
          <p style={{ lineHeight: 1.7, color: '#475569', margin: 0, whiteSpace: 'pre-line' }}>{analysis}</p>
        </Section>

        {/* Tips */}
        <Section title="💡 Smart Savings Tips" accent="#f59e0b">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tipLines.map((tip, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 12,
                padding: '14px 18px',
                background: `linear-gradient(135deg, ${['#eef2ff', '#f0fdf4', '#fff7ed'][i % 3]}, #fff)`,
                borderRadius: 10,
                borderLeft: `4px solid ${[COLORS['Shopping'], COLORS['Food & Dining'], COLORS['Recreation']][i % 3]}`,
              }}>
                <span style={{ fontSize: 20 }}>{['💰', '🛒', '🚀'][i % 3]}</span>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#374151', fontSize: 13 }}>{tip}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        color: '#94a3b8',
      }}>
        <span>SecureBank · Confidential Financial Report</span>
        <span>{generated_at}</span>
      </div>
    </div>
  );
});

const Section = ({ title, accent, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: accent }} />
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
    </div>
    <div style={{
      background: '#f8fafc',
      borderRadius: 12,
      padding: '20px 24px',
      border: '1px solid #f1f5f9',
    }}>
      {children}
    </div>
  </div>
);

// ── Main exported component ──────────────────────────────────────────────────
const ReportGenerator = ({ accountNumber, isProfile = false, username }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const printRef = useRef(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isProfile
        ? `/profile/analytics/report`
        : `/${accountNumber}/analytics/report`;

      const res = await API.get(endpoint);
      setReportData(res.data);

      // Wait for react to render the hidden report, then capture
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(printRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2],
          });

          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
          pdf.save(`SecureBank_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (pdfErr) {
          console.error('PDF generation error:', pdfErr);
          setError('Failed to generate PDF. Please try again.');
        } finally {
          setLoading(false);
        }
      }, 800);
    } catch (err) {
      console.error('Report fetch error:', err);
      setError('Failed to generate report. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Button ── */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary"
          style={{
            padding: '14px 40px',
            borderRadius: '12px',
            fontSize: '16px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              Generating Report...
            </>
          ) : (
            <>
              <span style={{ fontSize: '20px' }}>📄</span>
              Download AI Financial Report
            </>
          )}
        </button>

        {error && (
          <p style={{ color: 'var(--color-danger)', marginTop: 12, fontSize: '14px', fontWeight: '500' }}>{error}</p>
        )}
      </div>

      {/* ── Hidden printable report (off-screen) ── */}
      <div style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        zIndex: -1,
        pointerEvents: 'none',
      }}>
        <PrintableReport ref={printRef} data={reportData} username={username} />
      </div>
    </>
  );
};

export default ReportGenerator;
