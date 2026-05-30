import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    brand: '#0f172a',
    primary: '#2563eb',
    danger: '#ef4444',
    border: '#e2e8f0',
    textMuted: '#64748b',
  };

  const inputStyle = {
    padding: '11px 14px 11px 42px',
    borderRadius: '11px',
    border: `1.5px solid ${colors.border}`,
    fontSize: '1rem', // 16px min to prevent iOS zoom
    color: colors.brand,
    backgroundColor: '#fafbfc',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    WebkitAppearance: 'none', // Remove iOS default styling
  };

  const features = [
    { icon: '▦', label: 'FEMA P-154 compliant screening workflow' },
    { icon: '⬡', label: 'Multi-building portfolio management' },
    { icon: '≡', label: 'Detailed seismic assessment records' },
    { icon: '⊹', label: 'Role-based inspector and admin access' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .login-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1) !important;
          background-color: white !important;
        }

        .sign-in-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .sign-in-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(37,99,235,0.4) !important;
          filter: brightness(1.05);
        }
        .sign-in-btn:active:not(:disabled) { transform: translateY(0); filter: brightness(0.97); }
        .sign-in-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .loader-ring {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top: 2.5px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .feature-row {
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .feature-row:hover {
          background-color: rgba(255,255,255,0.04) !important;
          transform: translateX(5px);
        }

        .show-pw-btn {
          transition: all 0.2s ease;
          opacity: 0.6;
          -webkit-tap-highlight-color: transparent;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .show-pw-btn:hover {
          color: #2563eb !important;
          opacity: 1;
          transform: scale(1.1);
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }

        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }

        /* ── Layout: desktop side-by-side, mobile stacked ── */
        .page-layout {
          display: flex;
          flex-direction: row;
          min-height: 100vh;
        }

        .brand-panel {
          width: 480px;
          flex-shrink: 0;
          background-color: #0f172a;
          display: flex;
          flex-direction: column;
          padding: 56px 60px;
          position: relative;
          overflow: hidden;
        }

        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background-color: #f8fafc;
          background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
          background-size: 30px 30px;
        }

        .form-card {
          width: 100%;
          max-width: 440px;
          background-color: white;
          border-radius: 32px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 30px 80px -15px rgba(15,23,42,0.1);
          overflow: hidden;
          position: relative;
        }

        .form-card-inner {
          padding: 48px 48px 40px 48px;
        }

        /* Features grid: 2 cols on mobile brand header */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* ── Mobile breakpoint ── */
        @media (max-width: 768px) {
          .page-layout {
            flex-direction: column;
            min-height: 100vh;
          }

          .brand-panel {
            width: 100%;
            padding: 28px 24px 24px 24px;
            flex-shrink: unset;
          }

          /* Hide decorative blobs on mobile to save space */
          .brand-deco { display: none; }

          /* Compact logo row */
          .brand-logo-block {
            margin-bottom: 20px !important;
          }

          /* Hide the long headline and tagline on mobile */
          .brand-headline-block { display: none; }

          /* Compact feature list as horizontal chips */
          .features-list {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
          }

          .feature-row {
            padding: 7px 12px !important;
            border-radius: 20px !important;
            background-color: rgba(255,255,255,0.05) !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            flex: 0 1 auto;
          }
          .feature-row:hover { transform: none !important; }

          .feature-label {
            font-size: 0.72rem !important;
          }

          /* Status pill */
          .status-pill {
            margin-top: 20px !important;
          }

          /* Right panel full width */
          .right-panel {
            flex: unset;
            padding: 24px 16px 40px 16px;
            /* Solid bg on mobile (dots look busy on small screens) */
            background-image: none;
            background-color: #f1f5f9;
            align-items: flex-start;
          }

          .form-card {
            border-radius: 24px;
            max-width: 100%;
            box-shadow: 0 4px 20px rgba(15,23,42,0.08);
          }

          .form-card-inner {
            padding: 32px 24px 28px 24px;
          }

          .form-header {
            margin-bottom: 28px !important;
          }

          .form-title {
            font-size: 1.6rem !important;
          }

          .form-fields-gap {
            gap: 18px !important;
          }

          .submit-btn {
            padding: 14px !important;
            margin-top: 4px !important;
          }

          .register-row {
            margin-top: 24px !important;
          }
        }

        /* Very small screens (≤380px) */
        @media (max-width: 380px) {
          .brand-panel {
            padding: 20px 16px 18px 16px;
          }
          .form-card-inner {
            padding: 28px 18px 24px 18px;
          }
          .features-list {
            gap: 6px;
          }
        }
      `}</style>

      <div className="page-layout">

        {/* ── Left brand panel ── */}
        <div className="brand-panel">
          {/* Decorative Background Elements */}
          <div className="brand-deco" style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <div className="brand-deco" style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

          {/* Logo */}
          <div className="animate-slide-up brand-logo-block" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '72px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(145deg, #3b82f6 0%, #1d4ed8 55%, #1e3a8a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(37,99,235,0.4)',
              position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)', borderRadius: '14px 14px 0 0' }}></div>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                <rect x="3" y="12" width="3" height="9" rx="1" fill="rgba(255,255,255,0.9)" />
                <rect x="7.5" y="8" width="3" height="13" rx="1" fill="white" />
                <rect x="12" y="10" width="3" height="11" rx="1" fill="rgba(255,255,255,0.9)" />
                <rect x="16.5" y="14" width="3" height="7" rx="1" fill="rgba(255,255,255,0.7)" />
                <path d="M2 12 Q5 5 8 10 Q11 15 13 8 Q15 2 18 9 Q20 14 22 12" stroke="rgba(147,197,253,0.9)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(90deg, #ffffff 0%, #bfdbfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SeismoScan
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '5px' }}>
                RVS Intelligence v1
              </div>
            </div>
          </div>

          {/* Headline — hidden on mobile via CSS */}
          <div className="animate-slide-up delay-1 brand-headline-block" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-0.05em', margin: '0 0 24px 0', color: 'white' }}>
              Rapid Visual<br />Screening,<br />
              <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                precisely done.
              </span>
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 52px 0', lineHeight: 1.6, fontWeight: '500', maxWidth: '340px' }}>
              The definitive digital platform for FEMA P-154 seismic risk screening and portfolio safety management.
            </p>
          </div>

          {/* Features */}
          <div className="animate-slide-up delay-1 features-list" style={{ position: 'relative', zIndex: 1 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '14px' }}>
                <span style={{ fontSize: '1rem', color: '#60a5fa', flexShrink: 0, width: '18px', textAlign: 'center' }}>{f.icon}</span>
                <span className="feature-label" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', lineHeight: 1.4 }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Status pill */}
          <div className="animate-slide-up delay-2 status-pill" style={{ marginTop: '56px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pulse-soft" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 12px #10b981', flexShrink: 0 }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>All systems operational</span>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="right-panel">

          {/* Floating card */}
          <div className="animate-slide-up form-card">

            {/* Card top accent */}
            <div style={{ height: '5px', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #2563eb 100%)', backgroundSize: '200% 100%' }}></div>

            <div className="form-card-inner">

              {/* Header */}
              <div className="form-header" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Access Portal</span>
                </div>
                <h1 className="form-title" style={{ fontSize: '2rem', fontWeight: '900', color: colors.brand, letterSpacing: '-0.05em', margin: '0 0 10px 0', lineHeight: 1 }}>
                  Welcome back
                </h1>
                <p style={{ fontSize: '0.95rem', color: colors.textMuted, margin: 0, fontWeight: '500' }}>
                  Sign in to manage your assessments
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '14px 18px', borderRadius: '14px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', backgroundColor: 'rgba(239,68,68,0.06)', color: colors.danger, border: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="form-fields-gap">

                {/* Email field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      autoComplete="email"
                      inputMode="email"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Password
                    </label>
                    <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: '700', color: colors.primary, textDecoration: 'none' }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="login-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      style={{ ...inputStyle, paddingRight: '52px' }}
                    />
                    {/* Show/hide toggle — 44px tap target */}
                    <button
                      type="button"
                      className="show-pw-btn"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="sign-in-btn submit-btn"
                  disabled={loading}
                  style={{
                    marginTop: '8px',
                    padding: '16px',
                    borderRadius: '14px',
                    border: 'none',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    boxShadow: loading ? 'none' : '0 8px 20px rgba(37,99,235,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    minHeight: '52px', // good touch target
                  }}
                >
                  {loading ? (
                    <><span className="loader-ring"></span> Signing in…</>
                  ) : (
                    <>
                      Sign In
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <p className="register-row" style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.95rem', color: colors.textMuted, fontWeight: '500' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: colors.primary, fontWeight: '800', textDecoration: 'none' }}>
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;