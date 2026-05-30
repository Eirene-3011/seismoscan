import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/>
          <rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>
        </svg>
      ),
    },
    {
      to: '/buildings',
      label: 'Buildings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M3 9h18"/>
        </svg>
      ),
    },
    {
      to: '/assessments',
      label: 'Assessments',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    ...(user?.role === 'admin' ? [{
      to: '/users',
      label: 'Users',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    }] : []),
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const pageLabel = navItems.find(n => location.pathname.startsWith(n.to))?.label ?? 'SeismoScan';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Inter", system-ui, sans-serif', overflow: 'hidden', background: '#f8fafc' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        /* Navigation Links */
        .l-nav { 
          display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
          border-radius: 14px; text-decoration: none; font-size: 0.85rem; 
          font-weight: 600; color: rgba(255, 255, 255, 0.4); 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          position: relative; margin-bottom: 4px;
        }
        .l-nav:hover { background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.8); }
        .l-nav.active { 
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1)); 
          color: #fff; border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .l-nav .l-ind { 
          position: absolute; left: 0; top: 25%; bottom: 25%; width: 4px; 
          background: #6366f1; border-radius: 0 4px 4px 0; 
          transition: all 0.3s ease; opacity: 0; transform: scaleY(0.5);
        }
        .l-nav.active .l-ind { opacity: 1; transform: scaleY(1); box-shadow: 0 0 10px #6366f1; }
        .l-nav .l-ico { transition: all 0.3s ease; opacity: 0.5; }
        .l-nav.active .l-ico { color: #818cf8; opacity: 1; transform: scale(1.1); }
        .l-nav:hover .l-ico { opacity: 1; }

        /* Logout Button */
        .l-logout { 
          display: flex; align-items: center; gap: 10px; width: 100%; 
          padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.05); 
          background: rgba(255, 255, 255, 0.02); color: rgba(255, 255, 255, 0.4); 
          font-size: 0.85rem; font-weight: 700; cursor: pointer; 
          transition: all 0.2s ease;
        }
        .l-logout:hover:not(:disabled) { 
          background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); 
          color: #f87171; transform: translateY(-1px);
        }
        .l-logout:disabled { opacity: 0.5; cursor: default; }

        /* Scrollbar */
        .l-main::-webkit-scrollbar { width: 6px; }
        .l-main::-webkit-scrollbar-track { background: transparent; }
        .l-main::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .l-main::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

        /* Animations */
        @keyframes l-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } }
        .l-dot { animation: l-pulse 2.5s ease-in-out infinite; }

        @keyframes slide-in { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-sidebar { animation: slide-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }

        /* ── Hamburger button (hidden on desktop) ── */
        .l-hamburger {
          display: none;
          align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 10px;
          border: 1px solid #e2e8f0; background: #f8fafc;
          cursor: pointer; color: #334155; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Mobile overlay backdrop ── */
        .l-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 19;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Mobile: show hamburger, hide sidebar by default ── */
        @media (max-width: 768px) {
          .l-hamburger { display: flex; }

          .l-sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            z-index: 20;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
            animation: none !important;
          }
          .l-sidebar.is-open {
            transform: translateX(0);
            box-shadow: 4px 0 40px rgba(0, 0, 0, 0.4);
          }
          .l-backdrop.is-open { display: block; }

          .l-header-breadcrumb { display: none; }
          .l-header-fema { display: none; }
        }

        @media print {
          aside, header { display: none !important; }
          .l-main { overflow: visible !important; }
        }
      `}</style>

      {/* ── Mobile backdrop overlay ── */}
      <div
        className={`l-backdrop${sidebarOpen ? ' is-open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ══ Sidebar ══ */}
      <aside className={`animate-sidebar l-sidebar${sidebarOpen ? ' is-open' : ''}`} style={{ 
        width: '260px', flexShrink: 0, 
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)', 
        display: 'flex', flexDirection: 'column', height: '100vh', 
        borderRight: '1px solid rgba(255, 255, 255, 0.05)', 
        boxShadow: '10px 0 30px rgba(0, 0, 0, 0.2)',
        zIndex: 10
      }}>

        {/* Brand Section */}
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <a href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }} onClick={closeSidebar}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0, 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)', 
              position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)' }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M8 11l3 3 5-5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(90deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SeismoScan
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '5px' }}>
                Structural Intel
              </div>
            </div>
          </a>
        </div>

        {/* Navigation Section */}
        <nav style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.2)', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0 16px', marginBottom: '16px' }}>
            Main Menu
          </div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `l-nav${isActive ? ' active' : ''}`} onClick={closeSidebar}>
              <span className="l-ind" />
              <span className="l-ico">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* System Status Section */}
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div className="l-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.35)', letterSpacing: '0.02em' }}>Core Systems Live</span>
          </div>
        </div>

        {/* User Footer Section */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '0.85rem', fontWeight: '900', color: 'white',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.role === 'inspector' ? 'Viewer' : user?.role}</div>
            </div>
          </div>
          <button className="l-logout" onClick={handleLogout} disabled={loggingOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ══ Main Area ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <header style={{ 
          height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 20px', flexShrink: 0, zIndex: 5,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger — mobile only */}
            <button
              className="l-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Breadcrumb — hidden on mobile */}
            <span className="l-header-breadcrumb" style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>SeismoScan</span>
            <svg className="l-header-breadcrumb" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>{pageLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* FEMA Protocol Badge — hidden on mobile */}
            <div className="l-header-fema" style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', 
              borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', 
              border: '1px solid rgba(99, 102, 241, 0.15)' 
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#6366f1', letterSpacing: '0.05em' }}>FEMA P-154</span>
            </div>

            {/* User Quick Chip */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', 
              borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' 
            }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '8px', 
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '0.7rem', fontWeight: '900', color: 'white', flexShrink: 0 
              }}>
                {initials}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main className="l-main" style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', position: 'relative' }}>
          <div style={{ minHeight: '100%', padding: '0' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
