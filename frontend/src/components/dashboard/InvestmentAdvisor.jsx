import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell
} from 'recharts';
import API from '../../api/axios';

// ── Static SecureBank featured plans ─────────────────────────────────────────
const SECUREBANK_FEATURED = [
  {
    id: 'sb-fd',
    name: 'SecureBank Fixed Deposit',
    tagline: 'Guaranteed returns, zero risk',
    rate: 8.2,
    type: 'Fixed Deposit',
    minAmount: 10000,
    tenure: '1-5 years',
    icon: '🏦',
    color: '#CCFF00',
    textColor: '#000',
    bgGradient: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
    badge: 'SecureBank Exclusive',
  },
  {
    id: 'sb-rd',
    name: 'SecureBank Recurring Deposit',
    tagline: 'Save monthly, earn big',
    rate: 7.5,
    type: 'Recurring Deposit',
    minAmount: 500,
    tenure: '6m - 10 years',
    icon: '💰',
    color: '#CCFF00',
    textColor: '#000',
    bgGradient: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
    badge: 'SecureBank Exclusive',
  },
  {
    id: 'sb-mf',
    name: 'SecureWealth Equity Fund',
    tagline: 'AI-managed equity for long-term wealth',
    rate: 14.5,
    type: 'Mutual Fund',
    minAmount: 500,
    tenure: '5+ years',
    icon: '📈',
    color: '#CCFF00',
    textColor: '#000',
    bgGradient: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
    badge: 'SecureBank Exclusive',
  },
];

// ── Type metadata ─────────────────────────────────────────────────────────────
const TYPE_META = {
  'Fixed Deposit':    { icon: '🏦', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  'Recurring Deposit':{ icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  'Mutual Fund':      { icon: '📈', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  'Health Insurance': { icon: '🏥', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  'Life Insurance':   { icon: '🛡️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  'PPF':              { icon: '🏛️', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  'NPS':              { icon: '🎯', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)' },
  'ELSS':             { icon: '💹', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  'RD':               { icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
};

const RISK_META = {
  Conservative: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '🛡️' },
  Moderate:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '⚖️' },
  Aggressive:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '🚀' },
};

const fmt = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ── Projection chart data ─────────────────────────────────────────────────────
function buildProjection(principal, monthlyAdd, rates, years = 15) {
  const data = [];
  for (let y = 0; y <= years; y++) {
    const row = { year: y === 0 ? 'Now' : `${y}Y` };
    rates.forEach(({ label, rate }) => {
      const r = rate / 100;
      // Compound annually with monthly additions
      let fv = principal * Math.pow(1 + r, y);
      if (y > 0) {
        fv += monthlyAdd * 12 * ((Math.pow(1 + r, y) - 1) / r);
      }
      row[label] = Math.round(fv);
    });
    data.push(row);
  }
  return data;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-tertiary)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 10px 30px var(--color-shadow)',
      minWidth: 180,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
        {label === 'Now' ? 'Today' : `After ${label}`}
      </p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4, fontSize: 13 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Securebank featured card ──────────────────────────────────────────────────
const FeaturedCard = ({ plan }) => (
  <div style={{
    background: plan.bgGradient,
    borderRadius: 20,
    padding: '28px 24px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(204,255,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minWidth: 200,
    flex: '1 1 200px',
  }}>
    {/* Glow */}
    <div style={{
      position: 'absolute', top: -40, right: -40,
      width: 120, height: 120, borderRadius: '50%',
      background: 'rgba(204,255,0,0.07)', pointerEvents: 'none'
    }} />
    <div style={{
      display: 'inline-block',
      background: 'rgba(204,255,0,0.15)',
      color: plan.color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      padding: '3px 10px',
      borderRadius: 20,
      width: 'fit-content',
    }}>{plan.badge}</div>
    <div style={{ fontSize: 32 }}>{plan.icon}</div>
    <div>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)' }}>{plan.name}</p>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{plan.tagline}</p>
    </div>
    <div style={{ marginTop: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 800, color: plan.color, fontFamily: 'var(--font-display)' }}>
        {plan.rate}%
      </span>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 6 }}>p.a.</span>
    </div>
    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
      <span>Min: {fmt(plan.minAmount)}</span>
      <span>·</span>
      <span>Tenure: {plan.tenure}</span>
    </div>
  </div>
);

// ── AI recommendation card ────────────────────────────────────────────────────
const RecoCard = ({ plan, index }) => {
  const meta = TYPE_META[plan.type] || TYPE_META['Mutual Fund'];
  return (
    <div style={{
      background: 'var(--color-bg-tertiary)',
      border: `1px solid var(--color-border)`,
      borderRadius: 16,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 30px var(--color-shadow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 4, background: meta.color, borderRadius: '4px 0 0 4px'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: meta.bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>
            {meta.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                {plan.plan_name}
              </p>
              {plan.is_securebank && (
                <span style={{
                  background: 'var(--color-accent)', color: '#000',
                  fontSize: 9, fontWeight: 800, padding: '2px 8px',
                  borderRadius: 20, letterSpacing: 0.5, textTransform: 'uppercase'
                }}>SecureBank</span>
              )}
              {plan.priority === 'High' && (
                <span style={{
                  background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                  fontSize: 9, fontWeight: 800, padding: '2px 8px',
                  borderRadius: 20, letterSpacing: 0.5, textTransform: 'uppercase', border: '1px solid rgba(239,68,68,0.2)'
                }}>Top Pick</span>
              )}
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{plan.provider} · {plan.type}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginBottom: 2 }}>Suggested</p>
          <p style={{ fontWeight: 800, fontSize: 16, color: meta.color, fontFamily: 'var(--font-display)' }}>
            {fmt(plan.suggested_amount)}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>/ mo</p>
        </div>
      </div>

      <p style={{
        marginTop: 12, color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.6,
        background: meta.bg, borderRadius: 8, padding: '8px 12px'
      }}>
        💡 {plan.reason}
      </p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const InvestmentAdvisor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projYears, setProjYears] = useState(10);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await API.get('/profile/investment-advisor');
        setData(res.data);
      } catch (err) {
        setError('Failed to load investment recommendations. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.9s linear infinite'
        }} />
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Analysing your financial profile…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>⚠️</p>
        <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 8 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const { user_context, recommendations } = data;
  const riskMeta = RISK_META[recommendations.risk_profile] || RISK_META.Moderate;

  // Build projection rates based on recommendations
  const projRates = [
    { label: 'SecureBank FD (8.2%)',     rate: 8.2,  stroke: '#CCFF00' },
    { label: 'Mutual Fund (~14.5%)',     rate: 14.5, stroke: '#f59e0b' },
    { label: 'Savings Account (3.5%)',   rate: 3.5,  stroke: '#94a3b8' },
  ];

  const projData = buildProjection(
    user_context.total_balance,
    recommendations.investable_surplus,
    projRates,
    projYears
  );

  // Bar chart: investable surplus allocation across top 4 plans
  const topPlans = [...recommendations.personalized_recommendations]
    .sort((a, b) => b.suggested_amount - a.suggested_amount)
    .slice(0, 5);

  const allocData = topPlans.map(p => ({
    name: p.plan_name.length > 18 ? p.plan_name.slice(0, 18) + '…' : p.plan_name,
    amount: p.suggested_amount,
    color: TYPE_META[p.type]?.color || '#6366f1',
  }));

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Header & Risk Profile ── */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)',
        color: '#fff',
        padding: '36px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(204,255,0,0.04)', pointerEvents: 'none'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              AI Investment Advisor
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: '#fff', margin: 0 }}>
              Your Personal Investment Plan
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: 14, maxWidth: 500 }}>
              {recommendations.risk_reasoning}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
            <div style={{
              background: riskMeta.bg,
              border: `1px solid ${riskMeta.color}30`,
              borderRadius: 16, padding: '12px 20px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 24 }}>{riskMeta.icon}</p>
              <p style={{ color: riskMeta.color, fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)' }}>
                {recommendations.risk_profile}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Risk Profile</p>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Balance', value: fmt(user_context.total_balance), icon: '💳' },
            { label: 'Avg Monthly Spend', value: fmt(user_context.avg_monthly_spending), icon: '🛒' },
            { label: 'Est. Investable Monthly', value: fmt(recommendations.investable_surplus), icon: '📊' },
          ].map(k => (
            <div key={k.label} style={{
              flex: '1 1 150px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</p>
              <p style={{ color: '#CCFF00', fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-display)' }}>{k.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SecureBank Featured Plans ── */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 20 }}>🏦 SecureBank Exclusive Plans</h3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {SECUREBANK_FEATURED.map(p => <FeaturedCard key={p.id} plan={p} />)}
        </div>
      </div>

      {/* ── Growth Projection Chart ── */}
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: 0 }}>
              📈 Wealth Growth Projection
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 4 }}>
              Based on {fmt(user_context.total_balance)} corpus + {fmt(recommendations.investable_surplus)}/mo investment
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[5, 10, 15, 20].map(y => (
              <button
                key={y}
                onClick={() => setProjYears(y)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: `1px solid ${projYears === y ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: projYears === y ? 'var(--color-accent)' : 'transparent',
                  color: projYears === y ? '#000' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {y}Y
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={projData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <defs>
              {projRates.map(r => (
                <linearGradient key={r.label} id={`grad-${r.label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={r.stroke} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={r.stroke} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            {projRates.map(r => (
              <Area
                key={r.label}
                type="monotone"
                dataKey={r.label}
                stroke={r.stroke}
                strokeWidth={2.5}
                fill={`url(#grad-${r.label})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        {/* Final value callouts */}
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {projRates.map(r => {
            const last = projData[projData.length - 1];
            return (
              <div key={r.label} style={{
                flex: '1 1 150px',
                background: 'var(--color-bg-secondary)',
                borderRadius: 12, padding: '12px 16px',
                borderLeft: `3px solid ${r.stroke}`,
              }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginBottom: 4 }}>{r.label}</p>
                <p style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)', color: r.stroke }}>
                  {fmt(last?.[r.label] || 0)}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>after {projYears} years</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Allocation Bar Chart ── */}
      <div className="glass-card" style={{ padding: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: '0 0 6px' }}>
          🎯 Recommended Monthly Allocation
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 24 }}>
          How to split your {fmt(recommendations.investable_surplus)}/mo investable surplus
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={allocData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fill: 'var(--color-text-primary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
              {allocData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── AI Personalised Recommendations ── */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 8 }}>🤖 AI-Personalised Recommendations</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Tailored to your age ({user_context.age}), {user_context.marital_status} status, {user_context.income_range} income & spending behaviour.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {recommendations.personalized_recommendations.map((plan, i) => (
            <RecoCard key={i} plan={plan} index={i} />
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 12, padding: '16px 20px',
        color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6,
      }}>
        ⚠️ <strong>Disclaimer:</strong> These recommendations are AI-generated based on your profile and are for informational purposes only. Past returns are not indicative of future performance. Please consult a SEBI-registered financial advisor before making any investment decisions.
      </div>
    </div>
  );
};

export default InvestmentAdvisor;
