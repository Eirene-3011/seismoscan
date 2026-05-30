import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/* ── Enhanced Sparkline with Glow ── */
function Sparkline({ data, color }) {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const W = 100, H = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H;
    return `${x},${y}`;
  }).join(' ');
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
    </svg>
  );
}

/* ── Smooth Animated Counter ── */
function AnimatedCount({ target }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === undefined || target === null) { setVal(0); return; }
    const start = performance.now();
    const duration = 1500;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(Math.round(ease * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <>{val.toLocaleString()}</>;
}

/* ── Futuristic Ring Chart ── */
function RingChart({ passRate, failRate, brand }) {
  const R = 45, C = 60, circ = 2 * Math.PI * R;
  const passDash = (passRate / 100) * circ;
  const failDash = (failRate / 100) * circ;
  const off = -circ * 0.25;
  return (
    <svg width="140" height="140" viewBox="0 0 120 120" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}>
      <circle cx={C} cy={C} r={R} fill="none" stroke="#f8fafc" strokeWidth="10" />
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(226, 232, 240, 0.3)" strokeWidth="10" />
      {passRate > 0 && (
        <circle cx={C} cy={C} r={R} fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${passDash} ${circ}`} strokeDashoffset={off}
          style={{ transition: 'stroke-dasharray 1s ease-out', filter: 'drop-shadow(0 0 5px rgba(16,185,129,0.3))' }}
        />
      )}
      {failRate > 0 && (
        <circle cx={C} cy={C} r={R} fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${failDash} ${circ}`} strokeDashoffset={off - passDash}
          style={{ transition: 'stroke-dasharray 1s ease-out', filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.3))' }}
        />
      )}
      <text x={C} y={C + 5} textAnchor="middle" fontSize="22" fontWeight="900" fill={brand}
        fontFamily="Inter, system-ui, sans-serif" style={{ letterSpacing: '-0.05em' }}>{passRate}%</text>
      <text x={C} y={C + 20} textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8"
        fontFamily="Inter, system-ui, sans-serif" letterSpacing="0.1em">PASS RATE</text>
    </svg>
  );
}

/* ── Glassmorphism Wave Decoration ── */
function WaveDecor() {
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = (i / 39) * 100;
    const amp = Math.sin(i * 0.5) * 10 + Math.cos(i * 0.3) * 5;
    return `${x},${50 + amp}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="url(#waveGrad)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await reportAPI.getDashboardStats({ all: true });
      setStats(res.data.stats);
      setRecent(res.data.recent_assessments || []);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(.33); } 80%, 100% { opacity: 0; } }
        @keyframes pulse-circle { 0% { transform: scale(.8); } 50% { transform: scale(1); } 100% { transform: scale(.8); } }
        .loader-container { position: relative; width: 80px; height: 80px; }
        .loader-ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 4px solid #6366f1; border-radius: 50%; animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .loader-circle { position: absolute; top: 25%; left: 25%; width: 50%; height: 50%; background: #6366f1; border-radius: 50%; animation: pulse-circle 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite; box-shadow: 0 0 20px rgba(99,102,241,0.5); }
      `}</style>
      <div className="loader-container">
        <div className="loader-ring" />
        <div className="loader-circle" />
      </div>
      <span style={{ marginTop: '24px', fontSize: '0.85rem', fontWeight: '700', color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Initializing Dashboard</span>
    </div>
  );

  const total = stats?.total_assessments || 0;
  const passed = stats?.passed || 0;
  const failed = stats?.failed || 0;
  const bldgs = stats?.total_buildings || 0;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const statCards = [
    { label: 'Registered Buildings', value: bldgs, sub: 'in portfolio', color: '#6366f1', glow: 'rgba(99,102,241,0.2)', grad: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', spark: [80, 95, 105, 118, 125, 138, bldgs],
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9h18"/></svg> },
    { label: 'Total Assessments', value: total, sub: 'screenings', color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)', grad: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', spark: [42, 61, 37, 78, 55, 90, 68],
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label: 'Passed Screening', value: passed, sub: `${passRate}% success`, color: '#10b981', glow: 'rgba(16,185,129,0.2)', grad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', spark: [180, 195, 210, 225, 230, 242, passed],
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
    { label: 'High Risk / Failed', value: failed, sub: `${failRate}% require eval`, color: '#ef4444', glow: 'rgba(239,68,68,0.2)', grad: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', spark: [55, 62, 58, 70, 65, 72, failed],
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  ];

  const quickActions = [
    { label: 'Add New Building', to: '/buildings/new', color: '#6366f1', adminOnly: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9h18"/></svg> },
    { label: 'Start Assessment', to: '/assessments/new', color: '#8b5cf6', adminOnly: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
    { label: 'Browse Buildings', to: '/buildings', color: '#10b981', adminOnly: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'All Assessments', to: '/assessments', color: '#f59e0b', adminOnly: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  ];

  return (
    <div style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto', fontFamily: '"Inter", system-ui, sans-serif', color: '#0f172a', background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

        .d-card { 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          border: 1px solid rgba(226, 232, 240, 0.5);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }
        .d-card:hover { 
          transform: translateY(-8px) scale(1.01); 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08); 
          border-color: #6366f1;
        }
        .d-card:hover .d-icon { transform: rotate(10deg) scale(1.1); }
        .d-icon { transition: all 0.3s ease; }

        .d-row { transition: all 0.2s ease; cursor: pointer; }
        .d-row:hover { background: #f1f5f9 !important; }

        .d-btn-pri { 
          background: linear-gradient(135deg, #6366f1, #4f46e5); 
          color: white; border: none; padding: 10px 16px; border-radius: 14px; 
          font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; 
          cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          text-decoration: none; white-space: nowrap;
        }
        .d-btn-pri:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); filter: brightness(1.1); }
        
        .d-btn-sec { 
          background: white; color: #475569; border: 1px solid #e2e8f0; 
          padding: 10px 16px; border-radius: 14px; font-weight: 700; font-size: 0.8rem; 
          display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s;
          text-decoration: none; white-space: nowrap;
        }
        .d-btn-sec:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }

        .d-abt { 
          width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; 
          justify-content: center; background: #f8fafc; color: #94a3b8; border: 1px solid #e2e8f0; 
          transition: all 0.2s; text-decoration: none; flex-shrink: 0;
        }
        .d-abt:hover { background: #6366f1; color: white; border-color: #6366f1; transform: translateY(-2px); }

        .d-qa { 
          display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 14px; 
          text-decoration: none; transition: all 0.2s; border: 1px solid transparent;
        }
        .d-qa:hover { background: white; border-color: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); padding-left: 18px; }

        @keyframes d-fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .d-animate { animation: d-fade-in-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
        .d-delay-1 { animation-delay: 0.1s; }
        .d-delay-2 { animation-delay: 0.2s; }
        .d-delay-3 { animation-delay: 0.3s; }
        .d-delay-4 { animation-delay: 0.4s; }

        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .d-pulse { animation: pulse-soft 2s ease-in-out infinite; }

        /* ── Responsive Overrides ── */

        /* Padding for main wrapper */
        @media (min-width: 640px) {
          .dash-wrapper { padding: 24px !important; }
        }
        @media (min-width: 1024px) {
          .dash-wrapper { padding: 32px !important; }
        }

        /* Header */
        .dash-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (min-width: 640px) {
          .dash-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
          }
        }

        .dash-header-title {
          font-size: 1.75rem !important;
        }
        @media (min-width: 640px) {
          .dash-header-title { font-size: 2.5rem !important; }
        }

        .dash-header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Stat cards grid */
        .dash-stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (min-width: 768px) {
          .dash-stat-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }
        }

        /* Stat card inner adjustments on mobile */
        .dash-stat-value {
          font-size: 1.75rem !important;
        }
        @media (min-width: 640px) {
          .dash-stat-value { font-size: 2.5rem !important; }
        }

        /* Analytics panel */
        .dash-analytics {
          padding: 24px !important;
          margin-bottom: 20px !important;
        }
        @media (min-width: 768px) {
          .dash-analytics { padding: 40px !important; margin-bottom: 24px !important; }
        }

        .dash-analytics-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .dash-analytics-inner {
            grid-template-columns: 1fr auto;
            gap: 48px;
          }
        }

        .dash-analytics-title {
          font-size: 1.25rem !important;
        }
        @media (min-width: 640px) {
          .dash-analytics-title { font-size: 1.75rem !important; }
        }

        .dash-analytics-metrics {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        @media (min-width: 480px) {
          .dash-analytics-metrics { gap: 16px; margin-bottom: 32px; }
        }

        .dash-analytics-metric {
          padding: 12px 16px !important;
          min-width: 90px !important;
        }
        @media (min-width: 480px) {
          .dash-analytics-metric { padding: 16px 24px !important; min-width: 110px !important; }
        }

        .dash-analytics-metric-val {
          font-size: 1.5rem !important;
        }
        @media (min-width: 480px) {
          .dash-analytics-metric-val { font-size: 2rem !important; }
        }

        .dash-analytics-big-rate {
          font-size: 3.5rem !important;
        }
        @media (min-width: 480px) {
          .dash-analytics-big-rate { font-size: 5.5rem !important; }
        }

        .dash-analytics-big-rate-box {
          text-align: center;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(5px);
        }

        /* Main content layout */
        .dash-main-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .dash-main-layout {
            grid-template-columns: 1fr 320px;
            gap: 24px;
          }
        }

        /* Sidebar stacks below on mobile */
        .dash-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .dash-sidebar { gap: 20px; }
        }

        /* Distribution + quick actions go side by side on tablet */
        @media (min-width: 640px) and (max-width: 1023px) {
          .dash-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .dash-reference-card {
            grid-column: 1 / -1;
          }
        }

        /* Table: hide some columns on small screens */
        .dash-col-date { display: none; }
        .dash-col-score { display: none; }
        @media (min-width: 480px) {
          .dash-col-score { display: table-cell; }
        }
        @media (min-width: 640px) {
          .dash-col-date { display: table-cell; }
        }

        /* Table row padding tighter on mobile */
        .dash-td {
          padding: 14px 12px !important;
        }
        @media (min-width: 640px) {
          .dash-td { padding: 20px 24px !important; }
        }

        .dash-th {
          padding: 12px 12px !important;
        }
        @media (min-width: 640px) {
          .dash-th { padding: 16px 24px !important; }
        }

        /* Building name smaller on mobile */
        .dash-bldg-name {
          font-size: 0.8rem !important;
        }
        @media (min-width: 480px) {
          .dash-bldg-name { font-size: 0.9rem !important; }
        }
        .dash-bldg-addr {
          display: none;
        }
        @media (min-width: 480px) {
          .dash-bldg-addr { display: flex !important; }
        }

        /* Today string – hide on very small */
        .dash-today-str {
          display: none;
        }
        @media (min-width: 400px) {
          .dash-today-str { display: inline-flex !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="dash-header d-animate dash-wrapper" style={{ padding: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span className="dash-today-str" style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{today}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '30px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="d-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>Live System</span>
            </div>
          </div>
          <h1 className="dash-header-title" style={{ fontWeight: '900', margin: 0, letterSpacing: '-0.05em', color: '#0f172a', lineHeight: 1 }}>
            {greeting}, <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
            Managing <b style={{ color: '#0f172a' }}>{total}</b> screenings across <b style={{ color: '#0f172a' }}>{bldgs}</b> properties.
          </p>
        </div>
        {isAdmin && (
          <div className="dash-header-actions">
            <Link to="/buildings/new" className="d-btn-sec">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9h18"/></svg>
              Add Building
            </Link>
            <Link to="/assessments/new" className="d-btn-pri">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Assessment
            </Link>
          </div>
        )}
      </header>

      {/* ── Stat Cards ── */}
      <div className="dash-stat-grid">
        {statCards.map((s, i) => (
          <div key={i} className={`d-card d-animate d-delay-${i + 1}`}
            style={{ borderRadius: '20px', padding: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: s.grad }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div className="d-icon" style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 8px 16px ${s.glow}` }}>
                {s.icon}
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: '800', color: s.color, background: s.glow, padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', maxWidth: '80px', lineHeight: 1.4 }}>
                {s.sub}
              </span>
            </div>
            <div className="dash-stat-value" style={{ fontWeight: '900', color: '#0f172a', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.04em' }}>
              <AnimatedCount target={s.value} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '12px' }}>{s.label}</div>
            <Sparkline data={s.spark} color={s.color} />
          </div>
        ))}
      </div>

      {/* ── Analytics Panel ── */}
      {total > 0 && (
        <div className="dash-analytics d-animate d-delay-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)' }}>
          <WaveDecor />
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }} className="dash-analytics-inner">
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                FEMA P-154 · RVS LEVEL 1 · ANALYTICS
              </div>
              <h3 className="dash-analytics-title" style={{ fontWeight: '800', color: 'white', margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
                Portfolio Risk Overview
              </h3>

              <div className="dash-analytics-metrics">
                {[
                  { label: 'Passed', value: passed, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                  { label: 'High Risk', value: failed, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                  { label: 'Screened', value: total, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
                ].map((m) => (
                  <div key={m.label} className="dash-analytics-metric" style={{ borderRadius: '16px', background: m.bg, border: `1px solid ${m.border}` }}>
                    <div className="dash-analytics-metric-val" style={{ fontWeight: '900', color: m.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      <AnimatedCount target={m.value} />
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ maxWidth: '500px' }}>
                <div style={{ height: '12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', padding: '2px' }}>
                  <div style={{ height: '100%', width: `${passRate}%`, background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '20px', boxShadow: '0 0 15px rgba(16,185,129,0.4)', transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                  {failRate > 0 && <div style={{ height: '100%', width: `${failRate}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444)', borderRadius: '20px', marginLeft: '2px', boxShadow: '0 0 15px rgba(239,68,68,0.3)', transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>Pass {passRate}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>Fail {failRate}%</span>
                    </div>
                  </div>
                  <Link to="/assessments" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none' }}>
                    View Full Records
                  </Link>
                </div>
              </div>
            </div>

            <div className="dash-analytics-big-rate-box">
              <div className="dash-analytics-big-rate" style={{ fontWeight: '900', letterSpacing: '-0.07em', lineHeight: 1, background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {passRate}<span style={{ fontSize: '2rem', WebkitTextFillColor: 'rgba(255,255,255,0.2)' }}>%</span>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '10px' }}>
                Global Success Rate
              </div>
              <div style={{ marginTop: '16px', padding: '6px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>Benchmark: SL1 ≥ 2.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="dash-main-layout">
        
        {/* Recent Assessments Table */}
        <div className="d-animate d-delay-4" style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '16px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Recent Assessments</h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>FEMA P-154 Screening Logs</p>
            </div>
            <Link to="/assessments" className="d-btn-sec" style={{ padding: '7px 14px', fontSize: '0.7rem', borderRadius: '10px' }}>View All</Link>
          </div>

          {recent.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#f5f3ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>No Data Available</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '280px', margin: '0 auto 20px' }}>Begin your first structural assessment to see results here.</p>
              {isAdmin && (
                <Link to="/assessments/new" className="d-btn-pri" style={{ display: 'inline-flex', margin: '0 auto' }}>Start Assessment</Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="dash-th" style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>#</th>
                    <th className="dash-th" style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Building</th>
                    <th className="dash-th dash-col-date" style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date / Category</th>
                    <th className="dash-th dash-col-score" style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score</th>
                    <th className="dash-th" style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Result</th>
                    <th className="dash-th" style={{ fontSize: '0.6rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a, idx) => {
                    const isPass = a.result === 'PASS';
                    const score = parseFloat(a.final_score).toFixed(1);
                    return (
                      <tr key={a.id} className="d-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="dash-td" style={{ width: '32px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#cbd5e1' }}>{String(idx + 1).padStart(2, '0')}</span>
                        </td>
                        <td className="dash-td">
                          <div className="dash-bldg-name" style={{ fontWeight: '800', color: '#0f172a', marginBottom: '3px' }}>{a.building_name}</div>
                          <div className="dash-bldg-addr" style={{ fontSize: '0.7rem', color: '#64748b', alignItems: 'center', gap: '5px' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {a.building_address}
                          </div>
                        </td>
                        <td className="dash-td dash-col-date">
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a', marginBottom: '5px' }}>
                            {new Date(a.assessment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <span style={{ fontSize: '0.58rem', fontWeight: '800', background: '#f1f5f9', color: '#475569', padding: '3px 7px', borderRadius: '6px', textTransform: 'uppercase', border: '1px solid #e2e8f0' }}>
                            {a.building_type}
                          </span>
                        </td>
                        <td className="dash-td dash-col-score">
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '5px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: isPass ? '#10b981' : '#ef4444', letterSpacing: '-0.04em' }}>{score}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#cbd5e1' }}>/ 5.0</span>
                          </div>
                          <div style={{ width: '50px', height: '4px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(parseFloat(score) / 5) * 100}%`, background: isPass ? '#10b981' : '#ef4444', borderRadius: '4px' }} />
                          </div>
                        </td>
                        <td className="dash-td">
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '800', background: isPass ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: isPass ? '#10b981' : '#ef4444', border: `1px solid ${isPass ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                            {a.result}
                          </div>
                        </td>
                        <td className="dash-td">
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link to={`/assessments/${a.id}`} className="d-abt" title="View Details">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </Link>
                            <Link to={`/reports/${a.id}`} className="d-abt" title="Download Report">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="dash-sidebar d-animate d-delay-4">
          
          {/* Distribution Card */}
          {total > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score Distribution</h4>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <RingChart passRate={passRate} failRate={failRate} brand="#0f172a" />
              </div>
              <div className="form-grid-2" style={{ gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#10b981' }}>{passRate}%</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Pass</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ef4444' }}>{failRate}%</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Fail</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {quickActions
                .filter(qa => !qa.adminOnly || isAdmin)
                .map((qa, i) => (
                  <Link key={i} to={qa.to} className="d-qa">
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${qa.color}10`, color: qa.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {qa.icon}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>{qa.label}</span>
                    <svg style={{ marginLeft: 'auto', opacity: 0.3, flexShrink: 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                ))}
            </div>
          </div>

          {/* Reference Card */}
          <div className="dash-reference-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', filter: 'blur(20px)' }} />
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.6rem', fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>FEMA P-154 Reference</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'SL1 ≥ 2.0', desc: 'Acceptable structural risk', color: '#10b981' },
                { label: 'SL1 < 2.0', desc: 'Structural evaluation required', color: '#ef4444' },
              ].map((ref, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ref.color, boxShadow: `0 0 10px ${ref.color}`, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'white' }}>{ref.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{ref.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

export default DashboardPage;