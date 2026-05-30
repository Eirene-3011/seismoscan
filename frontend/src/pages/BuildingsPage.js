import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function BuildingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBuildings();
  }, [page, search]);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const res = await buildingAPI.getAll({ search, page, limit: 20 });
      setBuildings(res.data.buildings);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Load buildings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadBuildings();
  };

  const handleDeleteBuilding = async (id, name) => {
    if (window.confirm(`Delete building "${name}"? This cannot be undone.`)) {
      try {
        await buildingAPI.delete(id);
        loadBuildings();
      } catch (err) {
        console.error('Delete building error:', err);
        alert('Failed to delete building. It may have existing assessments.');
      }
    }
  };

  // Shared color palette — matches DashboardPage v4
  const colors = {
    brand: '#0f172a',
    primary: '#2563eb',
    primaryGlow: 'rgba(37, 99, 235, 0.1)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.1)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.1)',
    warning: '#f59e0b',
    surface: '#ffffff',
    background: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{
      padding: '32px',
      maxWidth: '1600px',
      margin: '0 auto',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      color: colors.text,
      lineHeight: 1.5,
    }}>
      <style>{`
        .glass-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid ${colors.border}; }

        .btn-premium { transition: all 0.2s ease; position: relative; overflow: hidden; cursor: pointer; }
        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(37, 99, 235, 0.2); }
        .btn-premium:active { transform: translateY(0); }

        .btn-ghost { transition: all 0.2s ease; cursor: pointer; }
        .btn-ghost:hover { background-color: ${colors.background} !important; border-color: ${colors.primary} !important; color: ${colors.primary} !important; }
        .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

        .table-row { transition: background-color 0.15s ease; border-bottom: 1px solid #f1f5f9; }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background-color: #f8fafc; }

        .search-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .search-input:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primaryGlow}; }

        .badge-count { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }

        .loader-ring {
          width: 48px; height: 48px;
          border: 4px solid rgba(37, 99, 235, 0.1);
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Page Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '900',
            margin: '0 0 8px 0',
            letterSpacing: '-0.04em',
            color: colors.brand,
          }}>
            Buildings
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textMuted, margin: 0, fontWeight: '500' }}>
            Manage all registered buildings for RVS assessment
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/buildings/new"
            className="btn-premium"
            style={{
              backgroundColor: colors.brand,
              color: 'white',
              padding: '12px 24px',
              borderRadius: '14px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.4rem', lineHeight: 0 }}>+</span> Add Building
          </Link>
        )}
      </header>

      {/* Main Card */}
      <div
        className="glass-card"
        style={{
          backgroundColor: colors.surface,
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Card Header */}
        <div style={{
          padding: '28px 36px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: colors.brand }}>
              Building Registry
            </h3>
            <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: '4px 0 0 0' }}>
              {total} building{total !== 1 ? 's' : ''} registered in the system
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textMuted,
                fontSize: '0.95rem',
                pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search name or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  paddingRight: '16px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  fontSize: '0.875rem',
                  width: '260px',
                  fontFamily: 'inherit',
                  color: colors.text,
                  backgroundColor: 'white',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-premium"
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              Search
            </button>

            {search && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setSearch(''); setPage(1); }}
                style={{
                  backgroundColor: 'white',
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Body: Loading */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 40px' }}>
            <div className="loader-ring"></div>
          </div>

        /* Body: Empty State */
        ) : buildings.length === 0 ? (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.1 }}>🏢</div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.brand, margin: '0 0 12px 0' }}>
              No Buildings Found
            </h4>
            <p style={{
              color: colors.textMuted,
              margin: '0 0 32px 0',
              maxWidth: '400px',
              marginInline: 'auto',
            }}>
              {search
                ? `No buildings match "${search}". Try a different search term or clear the filter.`
                : 'Start by registering your first building for RVS assessment.'}
            </p>
            {!search && isAdmin && (
              <Link
                to="/buildings/new"
                className="btn-premium"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 0 }}>+</span> Add First Building
              </Link>
            )}
          </div>

        /* Body: Table */
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  {['Building Name', 'Address', 'Use Type', 'Stories', 'Year Built', 'Assessments', 'Actions'].map((head, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '18px 20px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: colors.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        backgroundColor: '#f8fafc',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildings.map((b) => (
                  <tr key={b.id} className="table-row">
                    {/* Building Name */}
                    <td style={{ padding: '20px 20px' }}>
                      <div style={{ fontWeight: '800', color: colors.brand, fontSize: '0.95rem' }}>
                        {b.name}
                      </div>
                    </td>

                    {/* Address */}
                    <td style={{ padding: '20px 20px' }}>
                      <div style={{ fontSize: '0.875rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ opacity: 0.6 }}>📍</span>
                        {b.address}
                      </div>
                    </td>

                    {/* Use Type */}
                    <td style={{ padding: '20px 20px' }}>
                      {b.use_type ? (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          backgroundColor: '#f1f5f9',
                          color: colors.textMuted,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          border: `1px solid ${colors.border}`,
                        }}>
                          {b.use_type}
                        </span>
                      ) : (
                        <span style={{ color: colors.border, fontSize: '0.9rem' }}>—</span>
                      )}
                    </td>

                    {/* Stories */}
                    <td style={{ padding: '20px 20px' }}>
                      <div style={{ fontSize: '0.875rem', color: colors.text, fontWeight: '600' }}>
                        {b.stories_above || 0}
                        <span style={{ color: colors.textMuted, fontWeight: '400' }}> above</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                        {b.stories_below || 0} below grade
                      </div>
                    </td>

                    {/* Year Built */}
                    <td style={{ padding: '20px 20px' }}>
                      <div style={{ fontSize: '0.9rem', color: colors.text, fontWeight: '600' }}>
                        {b.year_built || (
                          <span style={{ color: colors.border }}>Unknown</span>
                        )}
                      </div>
                    </td>

                    {/* Assessment Count */}
                    <td style={{ padding: '20px 20px' }}>
                      <span
                        className="badge-count"
                        style={{
                          backgroundColor: (b.assessment_count || 0) > 0 ? colors.primaryGlow : '#f1f5f9',
                          color: (b.assessment_count || 0) > 0 ? colors.primary : colors.textMuted,
                          border: `1px solid ${(b.assessment_count || 0) > 0 ? 'rgba(37,99,235,0.2)' : colors.border}`,
                        }}
                      >
                        {b.assessment_count || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '20px 20px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link
                          to={`/buildings/${b.id}`}
                          className="btn-ghost"
                          style={{
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: colors.textMuted,
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'white',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          View
                        </Link>
                        {isAdmin && (
                          <Link
                            to={`/assessments/new?building_id=${b.id}`}
                            className="btn-premium"
                            style={{
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              backgroundColor: colors.success,
                              border: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Assess
                          </Link>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteBuilding(b.id, b.name)}
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: colors.danger,
                              padding: '8px 16px',
                              borderRadius: '10px',
                              border: `1px solid ${colors.danger}`,
                              backgroundColor: 'white',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.danger; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = colors.danger; }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div style={{
            padding: '20px 28px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fafafa',
          }}>
            <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '500' }}>
              Page <strong style={{ color: colors.brand }}>{page}</strong> of {totalPages} —{' '}
              {total} buildings total
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-ghost"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  backgroundColor: 'white',
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              >
                ← Previous
              </button>
              <button
                className="btn-ghost"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  backgroundColor: 'white',
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildingsPage;
