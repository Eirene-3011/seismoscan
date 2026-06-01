import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { rvsAPI, API_BASE_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function AssessmentsListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ result: '', date_from: '', date_to: '' });
  const [page, setPage] = useState(1);

  const loadAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await rvsAPI.getAll(params);
      setAssessments(res.data.assessments || []);
    } catch (err) {
      console.error('Load assessments error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await rvsAPI.delete(id);
        loadAssessments();
      } catch (err) {
        console.error('Delete assessment error:', err);
        alert('Failed to delete assessment.');
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ result: '', date_from: '', date_to: '' });
    setPage(1);
  };

  // Helper to resolve a full absolute URL for an image path
  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}${path}`;
  };

  // Build the HTML string for a given table id from current assessments data
  const buildTableHTML = (tableId) => {
    switch (tableId) {
      case 'bulkTable1':
        return `
          <h2>TABLE 1: GENERAL BUILDING INFORMATION (ALL RECORDS)</h2>
          <table>
            <thead>
              <tr>
                <th>PHOTO</th><th>BUILDING NAME</th><th>ADDRESS</th><th>USE</th>
                <th>STORIES (A/B)</th><th>YEAR</th><th>AREA</th><th>OCCUPANCY</th>
                <th>SOIL</th><th>GEOLOGIC</th><th>ADJACENCY</th><th>VERTICAL</th>
                <th>PLAN</th><th>FALLING HAZARDS</th><th>SL1</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map(a => {
                const imgUrl = resolveImageUrl(a.building_photo);
                return `
                  <tr>
                    <td>${imgUrl ? `<img src="${imgUrl}" alt="Building" class="export-photo" crossorigin="anonymous" />` : 'N/A'}</td>
                    <td>${a.building_name || ''}</td>
                    <td>${a.building_address || ''}</td>
                    <td>${a.use_type || ''}</td>
                    <td>${a.stories_above || 0}/${a.stories_below || 0}</td>
                    <td>${a.year_built || ''}</td>
                    <td>${a.floor_area || ''}</td>
                    <td>${a.occupancy || ''}</td>
                    <td>${a.soil_type || ''}</td>
                    <td>Liq: ${a.geologic_liquefaction || ''}, Land: ${a.geologic_landslide || ''}, Surf: ${a.geologic_surf_rupt || ''}</td>
                    <td>Pound: ${a.adjacency_pounding ? 'Y' : 'N'}, Fall: ${a.adjacency_falling_hazards ? 'Y' : 'N'}</td>
                    <td>${a.irregularity_vertical ? 'Y' : 'N'}</td>
                    <td>${a.irregularity_plan ? 'Y' : 'N'}</td>
                    <td>${[
                      a.hazard_unbraced_chimneys ? 'Chimneys' : '',
                      a.hazard_parapets ? 'Parapets' : '',
                      a.hazard_heavy_cladding ? 'Cladding' : '',
                      a.hazard_appendages ? 'Appendages' : '',
                    ].filter(Boolean).join(', ') || 'None'}</td>
                    <td>${a.final_score || ''}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;

      case 'bulkTable2':
        return `
          <h2>TABLE 2: EXTENT OF REVIEW (ALL RECORDS)</h2>
          <table>
            <thead>
              <tr>
                <th>BUILDING NAME</th><th>EXTERIOR</th><th>INTERIOR</th>
                <th>DRAWING REVIEWED</th><th>SOIL TYPE SOURCE</th>
                <th>GEOLOGIC HAZARD SOURCE</th><th>CONTACT PERSON</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map(a => `
                <tr>
                  <td>${a.building_name || ''}</td>
                  <td>${a.exterior_review || ''}</td>
                  <td>${a.interior_review || ''}</td>
                  <td>${a.drawings_reviewed ? 'Yes' : 'No'}</td>
                  <td>${a.soil_source || ''}</td>
                  <td>${a.geologic_source || ''}</td>
                  <td>${a.contact_person || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

      case 'bulkTable3':
        return `
          <h2>TABLE 3: OTHER HAZARD (ALL RECORDS)</h2>
          <table>
            <thead>
              <tr>
                <th>BUILDING NAME</th><th>POUNDING</th><th>FALLING HAZARD</th>
                <th>GEOLOGIC HAZARD</th><th>SIGNIFICANT DAMAGE</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map(a => `
                <tr>
                  <td>${a.building_name || ''}</td>
                  <td>${a.other_hazard_pounding ? 'Yes' : 'No'}</td>
                  <td>${a.other_hazard_falling ? 'Yes' : 'No'}</td>
                  <td>${a.other_hazard_geologic ? 'Yes' : 'No'}</td>
                  <td>${a.other_hazard_damage ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

      case 'bulkTable4':
        return `
          <h2>TABLE 4: ACTION REQUIRED (ALL RECORDS)</h2>
          <table>
            <thead>
              <tr>
                <th rowspan="2">BUILDING NAME</th>
                <th colspan="4">DETAILED STRUCTURAL EVALUATION</th>
                <th colspan="4">DETAILED NONSTRUCTURAL EVALUATION</th>
              </tr>
              <tr>
                <th>YES, UNKNOWN TYPE</th>
                <th>YES, SCORE CUT-OFF</th>
                <th>YES, OTHER HAZARDS</th>
                <th>NO</th>
                <th>YES, NONSTRUCTURAL EVAL</th>
                <th>NO, MITIGATION REQ</th>
                <th>NO, NONE IDENTIFIED</th>
                <th>DNK</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map(a => `
                <tr>
                  <td>${a.building_name || ''}</td>
                  <td>${a.action_structural_unknown_type ? 'Yes' : 'No'}</td>
                  <td>${a.action_structural_score_cutoff ? 'Yes' : 'No'}</td>
                  <td>${a.action_structural_other_hazards ? 'Yes' : 'No'}</td>
                  <td>${a.action_structural_no ? 'Yes' : 'No'}</td>
                  <td>${a.action_nonstructural_yes ? 'Yes' : 'No'}</td>
                  <td>${a.action_nonstructural_no ? 'Yes' : 'No'}</td>
                  <td>${!(a.action_nonstructural_yes || a.action_nonstructural_no || a.action_nonstructural_dnk) ? 'Yes' : 'No'}</td>
                  <td>${a.action_nonstructural_dnk ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

      default:
        return '';
    }
  };

  // ── FIXED: open a new window instead of replacing document.body ──
  const handlePrintBulk = (tableId) => {
    const tableHTML = buildTableHTML(tableId);

    const win = window.open('', '_blank');
    if (!win) {
      alert('Please allow pop-ups for this site to use the export feature.');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk Export</title>
          <style>
            body { font-family: "Inter", sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; }
            h2 { font-size: 16px; margin-bottom: 10px; }
            .export-photo { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #eee; }
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>${tableHTML}</body>
      </html>
    `);
    win.document.close();

    // Wait for all images to load before printing
    win.onload = () => {
      const images = win.document.querySelectorAll('img');

      if (images.length === 0) {
        win.focus();
        win.print();
        win.close();
        return;
      }

      let loadedCount = 0;
      const tryPrint = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          win.focus();
          win.print();
          win.close();
        }
      };

      images.forEach(img => {
        if (img.complete) {
          tryPrint();
        } else {
          img.onload = tryPrint;
          img.onerror = tryPrint; // still proceed even if an image fails
        }
      });
    };
  };

  const colors = {
    brand: '#0f172a',
    primary: '#2563eb',
    primaryGlow: 'rgba(37, 99, 235, 0.1)',
    success: '#10b981',
    successGlow: 'rgba(16, 185, 129, 0.1)',
    danger: '#ef4444',
    dangerGlow: 'rgba(239, 68, 68, 0.1)',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
  };

  const hasActiveFilters = filters.result || filters.date_from || filters.date_to;

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
        .btn-premium { transition: all 0.2s ease; cursor: pointer; }
        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(37,99,235,0.2); }
        .btn-premium:active { transform: translateY(0); }

        .btn-ghost { transition: all 0.2s ease; cursor: pointer; }
        .btn-ghost:hover { background-color: #f8fafc !important; border-color: #2563eb !important; color: #2563eb !important; }
        .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-danger { transition: all 0.2s ease; cursor: pointer; background-color: white; color: #ef4444; border: 1px solid #ef4444; }
        .btn-danger:hover { background-color: #ef4444 !important; color: white !important; }

        .table-row { transition: background-color 0.15s ease; border-bottom: 1px solid #f1f5f9; }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background-color: #f8fafc; }

        .filter-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; font-family: inherit; }
        .filter-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .loader-ring { width: 48px; height: 48px; border: 4px solid rgba(37,99,235,0.1); border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4,0,0.2,1) infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Page Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '40px', flexWrap: 'wrap', gap: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.04em', color: colors.brand }}>
            RVS Assessments
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textMuted, margin: 0, fontWeight: '500' }}>
            All FEMA P-154 rapid visual screening records
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handlePrintBulk('bulkTable1')} className="btn-ghost" style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', border: `1px solid ${colors.border}`, backgroundColor: 'white' }}>EXPORT TABLE 1</button>
            <button onClick={() => handlePrintBulk('bulkTable2')} className="btn-ghost" style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', border: `1px solid ${colors.border}`, backgroundColor: 'white' }}>EXPORT TABLE 2</button>
            <button onClick={() => handlePrintBulk('bulkTable3')} className="btn-ghost" style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', border: `1px solid ${colors.border}`, backgroundColor: 'white' }}>EXPORT TABLE 3</button>
            <button onClick={() => handlePrintBulk('bulkTable4')} className="btn-ghost" style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', border: `1px solid ${colors.border}`, backgroundColor: 'white' }}>EXPORT TABLE 4</button>
          </div>
          {isAdmin && (
            <Link
              to="/assessments/new"
              className="btn-premium"
              style={{
                backgroundColor: colors.primary, color: 'white',
                padding: '12px 24px', borderRadius: '14px',
                textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 0 }}>+</span> New Assessment
            </Link>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Result filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Result
          </label>
          <select
            name="result"
            className="filter-input"
            value={filters.result}
            onChange={handleFilterChange}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              border: `1px solid ${filters.result ? colors.primary : colors.border}`,
              fontSize: '0.875rem', color: colors.text,
              backgroundColor: filters.result ? colors.primaryGlow : 'white',
              width: '150px',
            }}
          >
            <option value="">All Results</option>
            <option value="PASS">PASS</option>
            <option value="FAIL">FAIL</option>
          </select>
        </div>

        {/* Date From */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Date From
          </label>
          <input
            type="date"
            name="date_from"
            className="filter-input"
            value={filters.date_from}
            onChange={handleFilterChange}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              border: `1px solid ${filters.date_from ? colors.primary : colors.border}`,
              fontSize: '0.875rem', color: colors.text,
              backgroundColor: filters.date_from ? colors.primaryGlow : 'white',
              width: '160px',
            }}
          />
        </div>

        {/* Date To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Date To
          </label>
          <input
            type="date"
            name="date_to"
            className="filter-input"
            value={filters.date_to}
            onChange={handleFilterChange}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              border: `1px solid ${filters.date_to ? colors.primary : colors.border}`,
              fontSize: '0.875rem', color: colors.text,
              backgroundColor: filters.date_to ? colors.primaryGlow : 'white',
              width: '160px',
            }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Active filter indicator + Clear */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '0.75rem', fontWeight: '700',
              backgroundColor: colors.primaryGlow, color: colors.primary,
              border: `1px solid rgba(37,99,235,0.2)`,
              padding: '4px 12px', borderRadius: '20px',
            }}>
              Filters active
            </span>
            <button
              className="btn-ghost"
              onClick={clearFilters}
              style={{
                backgroundColor: 'white', color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                padding: '9px 18px', borderRadius: '10px',
                fontWeight: '600', fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '32px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Card Header */}
        <div style={{
          padding: '24px 36px',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: '#fafafa',
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: colors.brand }}>
            Assessment Records
          </h3>
          <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: '4px 0 0 0' }}>
            Showing page {page} · 25 per page
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 40px' }}>
            <div className="loader-ring"></div>
          </div>

        /* Empty */
        ) : assessments.length === 0 ? (
          <div style={{ padding: '100px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.1 }}>📋</div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.brand, margin: '0 0 12px 0' }}>
              No Assessments Found
            </h4>
            <p style={{ color: colors.textMuted, margin: '0 0 32px 0', maxWidth: '380px', marginInline: 'auto' }}>
              {hasActiveFilters
                ? 'No records match your current filters. Try adjusting or clearing them.'
                : 'No assessments have been recorded yet. Start your first screening below.'}
            </p>
            {!hasActiveFilters && (
              <Link
                to="/assessments/new"
                className="btn-premium"
                style={{
                  backgroundColor: colors.primary, color: 'white',
                  padding: '12px 24px', borderRadius: '14px',
                  textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem',
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 0 }}>+</span> Create First Assessment
              </Link>
            )}
          </div>

        /* Table */
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  {['#', 'Building', 'Date', 'Viewer', 'Type', 'Soil', 'SL1 Score', 'Result', 'Actions'].map((head, i) => (
                    <th key={i} style={{
                      padding: '16px 20px',
                      fontSize: '0.72rem', fontWeight: '800',
                      color: colors.textMuted,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      backgroundColor: '#f8fafc', whiteSpace: 'nowrap',
                    }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const isPass = a.result === 'PASS';
                  return (
                    <tr key={a.id} className="table-row">
                      {/* ID */}
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.textMuted }}>
                          #{a.id}
                        </span>
                      </td>

                      {/* Building */}
                      <td style={{ padding: '18px 20px', maxWidth: '220px' }}>
                        <div style={{ fontWeight: '800', color: colors.brand, fontSize: '0.9rem', marginBottom: '4px' }}>
                          {a.building_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ opacity: 0.6 }}>📍</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                            {a.building_address}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text }}>
                          {new Date(a.assessment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Viewer */}
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.875rem', color: colors.text, fontWeight: '500' }}>
                          {a.inspector_name}
                        </div>
                      </td>

                      {/* Building Type */}
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: '800',
                          backgroundColor: '#f1f5f9', color: colors.textMuted,
                          padding: '4px 10px', borderRadius: '8px',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          border: `1px solid ${colors.border}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {a.building_type}
                        </span>
                      </td>

                      {/* Soil */}
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.875rem', color: colors.text, fontWeight: '500' }}>
                          {a.soil_type}
                        </div>
                      </td>

                      {/* Score */}
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                          <span style={{
                            fontSize: '1.35rem', fontWeight: '900', lineHeight: 1,
                            color: isPass ? colors.success : colors.danger,
                          }}>
                            {parseFloat(a.final_score).toFixed(1)}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>
                            / 5.0
                          </span>
                        </div>
                      </td>

                      {/* Result badge */}
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '5px 12px', borderRadius: '10px',
                          fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em',
                          backgroundColor: isPass ? colors.successGlow : colors.dangerGlow,
                          color: isPass ? colors.success : colors.danger,
                          border: `1px solid ${isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', flexShrink: 0 }}></span>
                          {a.result}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/assessments/${a.id}`}
                            className="btn-ghost"
                            style={{
                              textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700',
                              color: colors.textMuted, padding: '7px 14px', borderRadius: '9px',
                              border: `1px solid ${colors.border}`, backgroundColor: 'white',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            View
                          </Link>
                          {isAdmin && (
                            <button
                              className="btn-danger"
                              onClick={() => handleDelete(a.id)}
                              style={{
                                fontSize: '0.78rem', fontWeight: '700',
                                padding: '7px 14px', borderRadius: '9px',
                                whiteSpace: 'nowrap', fontFamily: 'inherit',
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{
          padding: '18px 28px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa',
        }}>
          <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '500' }}>
            Page <strong style={{ color: colors.brand }}>{page}</strong>
            {assessments.length < 25 && page === 1 && ` · ${assessments.length} record${assessments.length !== 1 ? 's' : ''}`}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-ghost"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                backgroundColor: 'white', color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                padding: '8px 18px', borderRadius: '10px',
                fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit',
              }}
            >
              ← Previous
            </button>
            <button
              className="btn-ghost"
              disabled={assessments.length < 25}
              onClick={() => setPage(p => p + 1)}
              style={{
                backgroundColor: 'white', color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                padding: '8px 18px', borderRadius: '10px',
                fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentsListPage;
