import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportAPI } from '../utils/api';
import './ReportPage.css';

function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef();

const loadReport = useCallback(async () => {
  try {
    const res = await reportAPI.getReport(id);
    setReport(res.data.report);
  } catch (err) {
    console.error('Load report error:', err);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => { loadReport(); }, [loadReport]);

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = printRef.current;
      const opt = {
        margin: [5, 5],
        filename: `SeismoScan_Report_${id}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(element).save();
    } finally {
      setExporting(false);
    }
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '16px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <style>{`@keyframes _rsp{to{transform:rotate(360deg)}} ._rsp{width:42px;height:42px;border:3px solid rgba(99,102,241,.12);border-top:3px solid #6366f1;border-radius:50%;animation:_rsp .75s linear infinite}`}</style>
      <div className="_rsp" />
      <span style={{ fontSize: '.8rem', fontWeight: '600', color: '#94a3b8' }}>Loading report…</span>
    </div>
  );

  if (!report) return (
    <div style={{ padding: '32px', maxWidth: '500px', margin: '100px auto', textAlign: 'center', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(239,68,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Report Not Found</h3>
      <p style={{ color: '#94a3b8', margin: '0 0 20px 0', fontSize: '.86rem' }}>This report record could not be located.</p>
      <button onClick={() => navigate(-1)} style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '11px', fontWeight: '700', fontSize: '.86rem', cursor: 'pointer', fontFamily: 'inherit' }}>
        ← Go Back
      </button>
    </div>
  );

  const { table1_building_info: t1, table2_photos: t2, table3_review_hazards: t3, table4_action_required: t4 } = report;
  const isPass = t1.result === 'PASS';
  const resultColor = isPass ? '#10b981' : '#ef4444';

  const ynk = (val) => {
    if (val === true  || val === 1)    return 'Yes';
    if (val === false || val === 0)    return 'No';
    if (val === 'yes')  return 'Yes';
    if (val === 'no')   return 'No';
    if (val === 'dnk')  return 'DNK';
    return 'DNK';
  };
  const checked = (val) => {
    // MySQL TINYINT(1) may arrive as a Buffer if typeCast is not set in the pool.
    // Explicitly coerce: Buffer <00> → false, Buffer <01> → true, 0 → false, 1 → true.
    if (val && typeof val === 'object' && val.type === 'Buffer') {
      return val.data?.[0] === 1 ? '☑' : '☐';
    }
    return val ? '☑' : '☐';
  };

  return (
    <div style={{ fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── print: fit FEMA form to one A4 page ── */
        @media print {
          @page { size: A4 portrait; margin: 5mm; }
          body { margin: 0; padding: 0; }
          .rp-ctrl, .rp-banner, .non-fema-section { display: none !important; }
          .rp-wrap { padding: 0 !important; background: white !important; min-height: auto !important; }
          .rvs-print-form { 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            transform: scale(0.92); 
            transform-origin: top center;
          }
        }

        /* ── control bar buttons ── */
        .rp-btn-back { background:white;color:#64748b;border:1px solid #e2e8f0;padding:9px 18px;border-radius:11px;font-weight:700;font-size:.82rem;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .18s; }
        .rp-btn-back:hover { border-color:#6366f1;color:#6366f1; }
        .rp-btn-print { background:white;color:#475569;border:1px solid #e2e8f0;padding:9px 18px;border-radius:11px;font-weight:700;font-size:.82rem;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .18s;box-shadow:0 1px 3px rgba(0,0,0,.06); }
        .rp-btn-print:hover { border-color:#6366f1;color:#6366f1; }
        .rp-btn-pdf { background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;padding:9px 20px;border-radius:11px;font-weight:700;font-size:.82rem;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:7px;box-shadow:0 4px 14px rgba(99,102,241,.35);transition:transform .2s,box-shadow .2s; }
        .rp-btn-pdf:hover { transform:translateY(-2px);box-shadow:0 8px 22px rgba(99,102,241,.45); }
        .rp-btn-pdf:disabled { opacity:.6;cursor:default;transform:none; }
        @keyframes rp-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ══ Enhanced Control Bar (non-print) ══ */}
      <div className="rp-ctrl" style={{ padding: '20px 28px', background: 'white', borderBottom: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,.05)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Back */}
          <button className="rp-btn-back" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>

          {/* Report identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '.58rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                Assessment #{id}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.18)' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: '.58rem', fontWeight: '800', color: '#6366f1', letterSpacing: '.06em' }}>FEMA P-154</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(100,116,139,.07)', border: '1px solid rgba(100,116,139,.15)' }}>
                <span style={{ fontSize: '.58rem', fontWeight: '800', color: '#64748b', letterSpacing: '.05em' }}>{t1.building_type}</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '.9rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t1.building_name}
              </span>
              <span style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap' }}>
                — {new Date(t1.assessment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Score + Result chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ padding: '7px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ fontSize: '.55rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>SL1 Score</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-.03em', lineHeight: 1.1 }}>{t1.final_score.toFixed(1)}</div>
            </div>
            <div style={{ padding: '7px 16px', borderRadius: '10px', background: isPass ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${isPass ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`, textAlign: 'center' }}>
              <div style={{ fontSize: '.55rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>Result</div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: resultColor, letterSpacing: '.04em', lineHeight: 1.1 }}>{t1.result}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '36px', background: '#f1f5f9', flexShrink: 0 }} />

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="rp-btn-print" onClick={handlePrint}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
            <button className="rp-btn-pdf" onClick={handleExportPDF} disabled={exporting}>
              {exporting ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'rp-spin .7s linear infinite' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══ Report body ══ */}
      <div className="rp-wrap" style={{ padding: '28px', background: '#f8fafc', minHeight: '100vh' }}>
        {/* ── Visual result banner (non-print) ── */}
        <div className="rp-banner" style={{ maxWidth: '1100px', margin: '0 auto 20px', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)', borderRadius: '20px', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', boxShadow: '0 12px 32px -8px rgba(15,23,42,.35)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: `radial-gradient(circle,${resultColor}28 0%,transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '.58rem', fontWeight: '800', color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: '4px' }}>
              RVS Level 1 Screening · FEMA P-154 · HIGH Seismicity
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', letterSpacing: '-.02em' }}>
              {t1.building_name}
            </div>
            <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.35)', fontWeight: '500', marginTop: '3px' }}>
              {t1.address}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            {[
              { label: 'Base Score', val: t1.base_score.toFixed(1), col: 'rgba(255,255,255,.7)' },
              { label: 'Final SL1',  val: t1.final_score.toFixed(1), col: resultColor },
              { label: 'Building Type', val: t1.building_type, col: '#a5b4fc' },
              { label: 'Viewer', val: t1.inspector_name, col: 'rgba(255,255,255,.5)' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.55rem', fontWeight: '800', color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '2px' }}>{m.label}</div>
                <div style={{ fontSize: '.96rem', fontWeight: '900', color: m.col, letterSpacing: '-.02em' }}>{m.val}</div>
              </div>
            ))}
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,.08)' }} />
            <div style={{ padding: '10px 20px', borderRadius: '12px', background: isPass ? 'rgba(16,185,129,.18)' : 'rgba(239,68,68,.18)', border: `1px solid ${isPass ? 'rgba(16,185,129,.35)' : 'rgba(239,68,68,.35)'}`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '.04em', color: resultColor }}>{t1.result}</div>
              <div style={{ fontSize: '.58rem', fontWeight: '700', color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: '1px' }}>
                {isPass ? 'No L2 Required' : 'L2 Required'}
              </div>
            </div>
          </div>
        </div>

        {/* ══ Printable FEMA RVS Form ══ */}
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div ref={printRef} className="rvs-print-form" style={{ background: 'white', padding: '10px' }}>
            {/* Page Header */}
            <div className="rvs-page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Rapid Visual Screening of Buildings for Potential Seismic Hazards</div>
                <div style={{ fontSize: '11px' }}>FEMA P-154 Data Collection Form</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Level 1</div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>HIGH Seismicity</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0', border: '2px solid #000' }}>
              {/* Left column: Photo + Sketch */}
              <div style={{ borderRight: '1px solid #000' }}>
                <div className="rvs-photo-box" style={{ borderBottom: '1px solid #000' }}>
                  {t2.length > 0 ? (
                    <img
                      src={t2[0].url}
                      alt="Building"
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '11px', textAlign: 'center' }}>
                      PHOTOGRAPH
                    </div>
                  )}
                </div>
                <div className="rvs-sketch-box">
                  <div style={{ textAlign: 'center', fontSize: '10px', color: '#999', padding: '60px 0' }}>SKETCH</div>
                </div>
                <div style={{ padding: '4px', fontSize: '9px', borderTop: '1px solid #ccc' }}>
                  ☐ Additional sketches or comments on separate page
                </div>
              </div>

              {/* Right column: Building Info */}
              <div>
                <table className="rvs-info-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Address:</td>
                      <td colSpan={3} style={{ borderBottom: '1px solid #000' }}>{t1.address}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Zip:</td>
                      <td style={{ borderBottom: '1px solid #000', width: '120px' }}></td>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Building Name:</td>
                      <td style={{ borderBottom: '1px solid #000' }}>{t1.building_name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Use:</td>
                      <td colSpan={3} style={{ borderBottom: '1px solid #000' }}>{t1.use || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Latitude:</td>
                      <td style={{ borderBottom: '1px solid #000' }}>{t1.latitude || ''}</td>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Longitude:</td>
                      <td style={{ borderBottom: '1px solid #000' }}>{t1.longitude || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Ss:</td>
                      <td style={{ borderBottom: '1px solid #000' }}></td>
                      <td style={{ padding: '4px', fontWeight: 600 }}>S1:</td>
                      <td style={{ borderBottom: '1px solid #000' }}></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Screener(s):</td>
                      <td colSpan={2} style={{ borderBottom: '1px solid #000' }}>{t1.inspector_name}</td>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Date/Time: <span style={{ borderBottom: '1px solid #000', width: '80px', display: 'inline-block' }}>{new Date(t1.assessment_date).toLocaleDateString()}</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>No. Stories:</td>
                      <td>Above Grade: <strong>{t1.stories_above || 0}</strong></td>
                      <td>Below Grade: <strong>{t1.stories_below || 0}</strong></td>
                      <td>Year Built: <strong>{t1.year_built || 'DNK'}</strong> ☐ EST</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Total Floor Area (sq. ft.):</td>
                      <td colSpan={3}><strong>{t1.floor_area ? Number(t1.floor_area).toLocaleString() : 'DNK'}</strong></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Additions:</td>
                      <td colSpan={3}>{checked(t1.additions_none)} None  {checked(t1.additions_yes)} Yes, Year(s) Built: {t1.additions_yes || ''}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600, verticalAlign: 'top' }}>Occupancy:</td>
                      <td colSpan={3} style={{ fontSize: '9px', lineHeight: 1.6 }}>
                        {['Assembly', 'Commercial', 'Emer. Services', 'Historic', 'Shelter'].map(o => (
                          <span key={o}>{t1.occupancy === o ? '☑' : '☐'} {o}  </span>
                        ))}<br />
                        {['Industrial', 'Office', 'School', 'Government'].map(o => (
                          <span key={o}>{t1.occupancy === o ? '☑' : '☐'} {o}  </span>
                        ))}<br />
                        ☐ Utility  ☐ Warehouse  ☐ Residential  # Units: ___
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600, verticalAlign: 'top' }}>Soil Type:</td>
                      <td colSpan={3} style={{ fontSize: '9px' }}>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(s => (
                          <span key={s}>{t1.soil_type === s ? '☑' : '☐'} <strong>{s}</strong>  </span>
                        ))}
                        ☐ <strong>DNK</strong> — If DNK, assume Type D<br />
                        <span style={{ fontSize: '8px', color: '#666' }}>Hard Rock / Rock / Dense Soil / Stiff Soil / Soft Soil / Poor Soil</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Geologic Hazards:</td>
                      <td colSpan={3} style={{ fontSize: '9px' }}>
                        Liquefaction: {ynk(t3.geologic_liquefaction)}  Landslide: {ynk(t3.geologic_landslide)}  Surf. Rupt.: {ynk(t3.geologic_surf_rupt)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600 }}>Adjacency:</td>
                      <td colSpan={3} style={{ fontSize: '9px' }}>
                        {checked(t3.adjacency_pounding)} Pounding &nbsp;&nbsp;
                        {checked(t3.adjacency_falling_hazards)} Falling Hazards from Taller Adjacent Building
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600, verticalAlign: 'top' }}>Irregularities:</td>
                      <td colSpan={3} style={{ fontSize: '9px' }}>
                        {checked(t3.irregularity_vertical)} Vertical (type/severity): {t3.irregularity_vertical_type || '___________'}<br />
                        {checked(t3.irregularity_plan)} Plan (type): {t3.irregularity_plan_type || '___________'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', fontWeight: 600, verticalAlign: 'top' }}>Exterior Falling Hazards:</td>
                      <td colSpan={3} style={{ fontSize: '9px' }}>
                        {checked(t3.hazard_unbraced_chimneys)} Unbraced Chimneys &nbsp;&nbsp; {checked(t3.hazard_heavy_cladding)} Heavy Cladding or Heavy Veneer<br />
                        {checked(t3.hazard_parapets)} Parapets &nbsp;&nbsp; {checked(t3.hazard_appendages)} Appendages<br />
                        ☐ Other: {t3.hazard_other || ''}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px', fontWeight: 600, verticalAlign: 'top' }}>COMMENTS:</td>
                      <td colSpan={3} style={{ minHeight: '30px' }}>{t3.comments || ''}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ══ Scoring Table ══ */}
            <div style={{ border: '2px solid #000', borderTop: 'none' }}>
              <div style={{ background: '#e8e8e8', textAlign: 'center', fontWeight: 700, padding: '4px', fontSize: '11px', borderBottom: '1px solid #000' }}>
                BASIC SCORE, MODIFIERS, AND FINAL LEVEL 1 SCORE, S<sub>L1</sub>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ width: '130px', fontSize: '9px', padding: '2px' }}>FEMA BUILDING TYPE</th>
                    {/* DNK column header — blank cell per reference form */}
                    <th style={{ fontSize: '8px', padding: '2px' }}>Do Not Know</th>
                    {['W1','W1A','W2','S1','S2','S3','S4','S5','C1','C2','C3','PC1','PC2','RM1','RM2','URM','MH'].map(h => (
                      <th key={h} style={{ fontSize: '8px', padding: '2px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/*
                    ══════════════════════════════════════════════════════════════════════════
                    FEMA P-154 Table — HIGH Seismicity (verified against official FEMA form)
                    Column order (vi): 0=DNK | 1=W1 | 2=W1A | 3=W2 | 4=S1 | 5=S2 | 6=S3 |
                                       7=S4  | 8=S5 | 9=C1  | 10=C2 | 11=C3 | 12=PC1 |
                                       13=PC2 | 14=RM1 | 15=RM2 | 16=URM | 17=MH
                    DNK column is intentionally BLANK per official FEMA P-154 form.

                    CORRECTIONS applied (cross-checked against FEMA P-154 reference image):
                    ── Moderate Vertical Irregularity, V₁t ──
                       S4  (vi=7):  -0.5  → -0.6   [FIXED]
                       S5  (vi=8):  -0.6  → -0.5   [FIXED]
                       PC2 (vi=13):  0    → -0.5   [FIXED]
                    ── Pre-Code ──
                       W2  (vi=3):  -1.0  → -0.9   [FIXED]
                       S1  (vi=4):  -0.8  → -0.6   [FIXED]
                       PC1 (vi=12):  0    → -0.5   [FIXED]
                    ── Soil Type A or B ──
                       S2  (vi=5):   0.2  →  0.6   [FIXED]
                       S3  (vi=6):   0.5  →  0.1   [FIXED]
                       S4  (vi=7):   0.0  →  0.6   [FIXED]
                       C1  (vi=9):   0.5  →  0.4   [FIXED]
                       C2  (vi=10):  0.3  →  0.5   [FIXED]
                       PC2 (vi=13):  0.3  →  0.4   [FIXED]
                       RM1 (vi=14):  0.3  →  0.5   [FIXED]
                       RM2 (vi=15):  0.3  →  0.5   [FIXED]
                    ── Soil Type E (> 3 stories) ──
                       C3  (vi=11):  NA   → -0.3   [FIXED]
                       PC1 (vi=12): -0.4  →  NA    [FIXED]
                       PC2 (vi=13):  NA   → -0.4   [FIXED — column shift corrected]
                    ── Minimum Score, Smin ──
                       URM (vi=16):  1.0  →  0.2   [FIXED]
                    ══════════════════════════════════════════════════════════════════════════
                  */}
                  {[
                    {
                      label: 'Basic Score',
                      // DNK='' | W1=3.6 | W1A=3.2 | W2=2.9 | S1=2.1 | S2=2.0 | S3=2.6 | S4=2.0 | S5=1.7
                      // C1=1.5 | C2=2.0 | C3=1.2 | PC1=1.6 | PC2=1.4 | RM1=1.7 | RM2=1.7 | URM=1.0 | MH=1.5
                      values: ['', 3.6, 3.2, 2.9, 2.1, 2.0, 2.6, 2.0, 1.7, 1.5, 2.0, 1.2, 1.6, 1.4, 1.7, 1.7, 1.0, 1.5],
                    },
                    {
                      label: 'Severe Vertical Irregularity, V₁s',
                      // DNK='' | W1=-1.2 | W1A=-1.2 | W2=-1.2 | S1=-1.0 | S2=-1.0 | S3=-1.1 | S4=-1.0 | S5=-0.8
                      // C1=-0.9 | C2=-1.0 | C3=-0.7 | PC1=-1.0 | PC2=-0.9 | RM1=-0.9 | RM2=-0.9 | URM=-0.7 | MH=NA
                      values: ['', -1.2, -1.2, -1.2, -1.0, -1.0, -1.1, -1.0, -0.8, -0.9, -1.0, -0.7, -1.0, -0.9, -0.9, -0.9, -0.7, 'NA'],
                    },
                    {
                      label: 'Moderate Vertical Irregularity, V₁t',
                      // DNK='' | W1=-0.7 | W1A=-0.7 | W2=-0.7 | S1=-0.6 | S2=-0.6 | S3=-0.7 | S4=-0.6 | S5=-0.5
                      // C1=-0.5 | C2=-0.6 | C3=NA | PC1=-0.6 | PC2=-0.5 | RM1=-0.5 | RM2=-0.5 | URM=-0.4 | MH=NA
                      // FIXED: S4 -0.5→-0.6 | S5 -0.6→-0.5 | C1 -0.4→-0.5 | PC1 -0.5→-0.6 | PC2 0→-0.5
                      values: ['', -0.7, -0.7, -0.7, -0.6, -0.6, -0.7, -0.6, -0.5, -0.5, -0.6, 'NA', -0.6, -0.5, -0.5, -0.5, -0.4, 'NA'],
                    },
                    {
                      label: 'Plan Irregularity, P₁t',
                      // DNK='' | W1=-1.1 | W1A=-1.0 | W2=-1.0 | S1=-0.8 | S2=-0.7 | S3=-0.9 | S4=-0.7 | S5=-0.6
                      // C1=-0.6 | C2=-0.8 | C3=-0.5 | PC1=-0.7 | PC2=-0.6 | RM1=-0.7 | RM2=-0.7 | URM=-0.4 | MH=NA
                      values: ['', -1.1, -1.0, -1.0, -0.8, -0.7, -0.9, -0.7, -0.6, -0.6, -0.8, -0.5, -0.7, -0.6, -0.7, -0.7, -0.4, 'NA'],
                    },
                    {
                      label: 'Pre-Code',
                      // DNK='' | W1=-1.1 | W1A=-1.0 | W2=-0.9 | S1=-0.6 | S2=-0.6 | S3=-0.8 | S4=-0.6 | S5=-0.2
                      // C1=-0.4 | C2=-0.7 | C3=-0.1 | PC1=-0.5 | PC2=-0.3 | RM1=-0.5 | RM2=-0.5 | URM=0 | MH=-0.1
                      // FIXED: W2 -1.0→-0.9 | S1 -0.8→-0.6 | PC1 0→-0.5
                      values: ['', -1.1, -1.0, -0.9, -0.6, -0.6, -0.8, -0.6, -0.2, -0.4, -0.7, -0.1, -0.5, -0.3, -0.5, -0.5, 0, -0.1],
                    },
                    {
                      label: 'Post-Benchmark',
                      // DNK='' | W1=1.6 | W1A=1.9 | W2=2.2 | S1=1.4 | S2=1.4 | S3=1.1 | S4=1.9 | S5=NA
                      // C1=1.9 | C2=2.1 | C3=NA | PC1=2.0 | PC2=2.4 | RM1=2.1 | RM2=2.1 | URM=NA | MH=1.2
                      values: ['', 1.6, 1.9, 2.2, 1.4, 1.4, 1.1, 1.9, 'NA', 1.9, 2.1, 'NA', 2.0, 2.4, 2.1, 2.1, 'NA', 1.2],
                    },
                    {
                      label: 'Soil Type A or B',
                      // DNK='' | W1=0.1 | W1A=0.3 | W2=0.5 | S1=0.4 | S2=0.6 | S3=0.1 | S4=0.6 | S5=0.5
                      // C1=0.4 | C2=0.5 | C3=0.3 | PC1=0.6 | PC2=0.4 | RM1=0.5 | RM2=0.5 | URM=0.3 | MH=0.3
                      // FIXED: S2 0.2→0.6 | S3 0.5→0.1 | S4 0.0→0.6 | C1 0.5→0.4 | C2 0.3→0.5
                      //        PC2 0.3→0.4 | RM1 0.3→0.5 | RM2 0.3→0.5
                      values: ['', 0.1, 0.3, 0.5, 0.4, 0.6, 0.1, 0.6, 0.5, 0.4, 0.5, 0.3, 0.6, 0.4, 0.5, 0.5, 0.3, 0.3],
                    },
                    {
                      label: 'Soil Type E (1-3 stories)',
                      // DNK='' | W1=0.2 | W1A=0.2 | W2=0.1 | S1=-0.2 | S2=-0.4 | S3=0.2 | S4=-0.1 | S5=-0.4
                      // C1=0.0 | C2=0.0 | C3=-0.2 | PC1=-0.3 | PC2=-0.1 | RM1=-0.1 | RM2=-0.1 | URM=-0.2 | MH=-0.4
                      values: ['', 0.2, 0.2, 0.1, -0.2, -0.4, 0.2, -0.1, -0.4, 0.0, 0.0, -0.2, -0.3, -0.1, -0.1, -0.1, -0.2, -0.4],
                    },
                    {
                      label: 'Soil Type E (> 3 stories)',
                      // DNK='' | W1=-0.3 | W1A=-0.6 | W2=-0.9 | S1=-0.6 | S2=-0.6 | S3=NA | S4=-0.6 | S5=-0.4
                      // C1=-0.5 | C2=-0.7 | C3=-0.3 | PC1=NA | PC2=-0.4 | RM1=-0.5 | RM2=-0.6 | URM=-0.2 | MH=NA
                      // FIXED: C3 NA→-0.3 | PC1 -0.4→NA | PC2 NA→-0.4  (column-shift corrected)
                      values: ['', -0.3, -0.6, -0.9, -0.6, -0.6, 'NA', -0.6, -0.4, -0.5, -0.7, -0.3, 'NA', -0.4, -0.5, -0.6, -0.2, 'NA'],
                    },
                    {
                      label: 'Minimum Score, Smin',
                      // DNK='' | W1=1.1 | W1A=0.9 | W2=0.7 | S1=0.5 | S2=0.5 | S3=0.6 | S4=0.5 | S5=0.5
                      // C1=0.3 | C2=0.3 | C3=0.3 | PC1=0.2 | PC2=0.2 | RM1=0.3 | RM2=0.3 | URM=0.2 | MH=1.0
                      // FIXED: URM 1.0→0.2
                      values: ['', 1.1, 0.9, 0.7, 0.5, 0.5, 0.6, 0.5, 0.5, 0.3, 0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.2, 1.0],
                    },
                  ].map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                      <td style={{ fontStyle: ri === 9 ? 'italic' : 'normal', fontSize: '8px', padding: '1px 2px', border: '1px solid #ddd' }}>{row.label}</td>
                      {row.values.map((v, vi) => {
                        // vi=0 → DNK (always blank), vi=1..17 → W1..MH
                        const types = ['DNK','W1','W1A','W2','S1','S2','S3','S4','S5','C1','C2','C3','PC1','PC2','RM1','RM2','URM','MH'];
                        const isSelected = types[vi] === t1.building_type;
                        const isDNK = vi === 0;
                        return (
                          <td key={vi} style={{
                            textAlign: 'center',
                            fontSize: '8px',
                            padding: '1px 2px',
                            background: isSelected ? '#fff3cd' : 'transparent',
                            fontWeight: isSelected ? 700 : 400,
                            border: isSelected ? '1.5px solid #000' : '1px solid #ddd',
                            color: isDNK ? 'transparent' : 'inherit',  // DNK column: blank
                          }}>
                            {/* DNK column intentionally left blank per FEMA P-154 form */}
                            {isDNK ? '' : v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '6px 8px', fontWeight: 700, fontSize: '11px', background: '#f0f0f0' }}>
                FINAL LEVEL 1 SCORE, S<sub>L1</sub> ≥ S<sub>MIN</sub>: &nbsp;&nbsp;&nbsp;
                <span style={{ fontSize: '16px', padding: '1px 10px', border: '2px solid #000', background: t1.result === 'PASS' ? '#d4edda' : '#f8d7da', color: t1.result === 'PASS' ? '#155724' : '#721c24' }}>
                  {t1.final_score.toFixed(1)}
                </span>
                &nbsp;&nbsp;
                <span style={{ color: t1.result === 'PASS' ? '#155724' : '#721c24' }}>
                  → {t1.result}
                </span>
              </div>
            </div>

            {/* Bottom Three-Column Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '2px solid #000', borderTop: 'none' }}>
              {/* Extent of Review */}
              <div style={{ borderRight: '1px solid #000', padding: '4px 6px', fontSize: '8.5px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '9px', textDecoration: 'underline' }}>EXTENT OF REVIEW</div>
                <div>Exterior: {checked(t3.exterior_review === 'partial')} Partial  {checked(t3.exterior_review === 'all_sides')} All Sides  {checked(t3.exterior_review === 'aerial')} Aerial</div>
                <div>Interior: {checked(t3.interior_review === 'none')} None  {checked(t3.interior_review === 'visible')} Visible  {checked(t3.interior_review === 'entered')} Entered</div>
                <div>Drawings Reviewed: {checked(t3.drawings_reviewed)} Yes  {checked(!t3.drawings_reviewed)} No</div>
                <div>Soil Type Source: <u>{t3.soil_source || ''}</u></div>
                <div>Geologic Hazards Source: <u>{t3.geologic_source || ''}</u></div>
                <div>Contact Person: <u>{t3.contact_person || ''}</u></div>
                <div style={{ marginTop: '4px', fontWeight: 700 }}>LEVEL 2 SCREENING PERFORMED?</div>
                <div>☐ Yes, Final Level 2 Score, S<sub>L2</sub>: ___  ☐ No</div>
                <div>Nonstructural hazards?  ☐ Yes  ☐ No</div>
              </div>

              {/* Other Hazards */}
              <div style={{ borderRight: '1px solid #000', padding: '4px 6px', fontSize: '8.5px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '9px', textDecoration: 'underline' }}>OTHER HAZARDS</div>
                <div style={{ fontStyle: 'italic', marginBottom: '2px' }}>Are There Hazards That Trigger A Detailed Structural Evaluation?</div>
                <div>{checked(t3.other_hazard_pounding)} Pounding potential (unless S<sub>L2</sub> &gt; cut-off, if known)</div>
                <div>{checked(t3.other_hazard_falling)} Falling hazards from taller adjacent building</div>
                <div>{checked(t3.other_hazard_geologic)} Geologic hazards or Soil Type F</div>
                <div>{checked(t3.other_hazard_damage)} Significant damage/deterioration to the structural system</div>
              </div>

              {/* Action Required */}
              <div style={{ padding: '4px 6px', fontSize: '8.5px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '9px', textDecoration: 'underline' }}>ACTION REQUIRED</div>
                <div style={{ fontWeight: 700 }}>Detailed Structural Evaluation Required?</div>
                <div>☐ Yes, unknown FEMA building type or other building</div>
                <div>☐ Yes, score less than cut-off</div>
                <div>☐ Yes, other hazards present</div>
                <div>{checked(t1.result === 'PASS')} No</div>
                <div style={{ fontWeight: 700, marginTop: '4px' }}>Detailed Nonstructural Evaluation Recommended?</div>
                <div>☐ Yes, nonstructural hazards identified</div>
                <div>☐ No, nonstructural hazards exist</div>
                <div>{checked(t1.result === 'PASS')} No, no nonstructural hazards identified</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ border: '2px solid #000', borderTop: 'none', padding: '2px 6px', fontSize: '7.5px', background: '#f8f8f8' }}>
              <em>Where information cannot be verified, screener shall note the following: EST = Estimated or unreliable data OR DNK = Do Not Know</em><br />
              Legend: MRF = Moment-resisting frame | RC = Reinforced concrete | URM/INF = Unreinforced masonry infill | MH = Manufactured Housing | FD = Flexible diaphragm | BR = Braced frame | SW = Shear wall | TU = Tilt up | LM = Light metal | RD = Rigid diaphragm
            </div>

            {/* Summary Report Tables (ONLY VISIBLE ON WEB, HIDDEN IN PRINT/PDF) */}
            <div className="non-fema-section" style={{ marginTop: '30px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SeismoScan Summary Report — Assessment #{id}
              </h2>

              {/* Table 1: Building Info & Score */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ background: '#1e3a5f', color: '#fff', padding: '6px 10px', fontWeight: 700, fontSize: '11px' }}>
                  TABLE 1: BUILDING INFORMATION AND SEISMIC SCORE SUMMARY
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ccc' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, width: '40%', background: '#f8f8f8' }}>Building Name</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.building_name}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, width: '20%', background: '#f8f8f8' }}>Use Type</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.use || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>Address</td>
                      <td colSpan={3} style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.address}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>GPS Coordinates</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>Lat: {t1.latitude || 'N/A'} | Long: {t1.longitude || 'N/A'}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>Year Built</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.year_built || 'DNK'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>FEMA Building Type</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.building_type}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>Soil Type</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.soil_type}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>Base Score</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 700 }}>{t1.base_score.toFixed(1)}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 600, background: '#f8f8f8' }}>Viewer</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t1.inspector_name}</td>
                    </tr>
                    <tr style={{ background: t1.result === 'PASS' ? '#d4edda' : '#f8d7da' }}>
                      <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: '12px' }}>FINAL SCORE (SL1)</td>
                      <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: '16px' }}>{t1.final_score.toFixed(1)}</td>
                      <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: '12px' }}>RESULT</td>
                      <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: '16px', color: t1.result === 'PASS' ? '#155724' : '#721c24' }}>
                        {t1.result} {t1.result === 'PASS' ? '✓' : '✗'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 3: Other Hazards */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ background: '#1e3a5f', color: '#fff', padding: '6px 10px', fontWeight: 700, fontSize: '11px' }}>
                  TABLE 3: EXTENT OF REVIEW AND OTHER HAZARDS
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #ccc' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px 8px', fontWeight: 600, width: '30%', background: '#f8f8f8', borderBottom: '1px solid #eee' }}>Exterior Review</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t3.exterior_review?.replace('_', ' ')}</td>
                      <td style={{ padding: '5px 8px', fontWeight: 600, width: '30%', background: '#f8f8f8', borderBottom: '1px solid #eee' }}>Interior Review</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t3.interior_review}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', fontWeight: 600, background: '#f8f8f8', borderBottom: '1px solid #eee' }}>Drawings Reviewed</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{ynk(t3.drawings_reviewed)}</td>
                      <td style={{ padding: '5px 8px', fontWeight: 600, background: '#f8f8f8', borderBottom: '1px solid #eee' }}>Soil Source</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee' }}>{t3.soil_source || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', fontWeight: 600, background: '#f8f8f8' }}>Pounding Risk</td>
                      <td style={{ padding: '5px 8px' }}>{ynk(t3.adjacency_pounding)}</td>
                      <td style={{ padding: '5px 8px', fontWeight: 600, background: '#f8f8f8' }}>Falling Hazards</td>
                      <td style={{ padding: '5px 8px' }}>{ynk(t3.adjacency_falling_hazards)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 4: Action Required */}
              <div>
                <div style={{ background: '#1e3a5f', color: '#fff', padding: '6px 10px', fontWeight: 700, fontSize: '11px' }}>
                  TABLE 4: ACTION REQUIRED
                </div>
                <div style={{ border: '1px solid #ccc', padding: '12px', fontSize: '10px' }}>
                  <div style={{ padding: '10px 16px', background: t4.result === 'PASS' ? '#d4edda' : '#f8d7da', border: `2px solid ${t4.result === 'PASS' ? '#28a745' : '#dc3545'}`, borderRadius: '4px', marginBottom: '10px', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                    LEVEL 1 RVS RESULT: {t4.result} (SL1 = {t4.final_score.toFixed(1)})
                  </div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>RECOMMENDATION:</p>
                  <p>{t4.recommendation}</p>
                  {t4.result === 'FAIL' && (
                    <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#721c24' }}>
                      Per FEMA P-154: Buildings with SL1 &lt; 2.0 require a Level 2 evaluation or detailed structural analysis to determine if retrofit or other action is needed.
                    </p>
                  )}
                </div>
              </div>

              {/* Viewer Signature Area */}
              <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '11px' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '40px' }}></div>
                  <div>Viewer Signature</div>
                </div>
                <div>
                  <div style={{ borderBottom: '1px solid #000', marginBottom: '4px', height: '40px' }}></div>
                  <div>Date</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
