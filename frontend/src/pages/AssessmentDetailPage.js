import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rvsAPI, API_BASE_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/* ── waveform decoration ── */
function WaveDecor() {
  const pts = Array.from({ length: 70 }, (_, i) => {
    const x = (i / 69) * 100;
    const y = 50 + Math.sin(i * 0.38) * 9 + Math.sin(i * 0.9 + 1.2) * 5 + Math.sin(i * 0.2) * 6;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
      <polyline points={pts} fill="none" stroke="white" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── score gauge ── */
function ScoreGauge({ score, max = 5, isPass }) {
  const pct = Math.min(Math.max(score / max, 0), 1);
  const R = 52, C = 64, stroke = 13;
  const circ = 2 * Math.PI * R;
  const arcLen = circ * 0.75;
  const filled = arcLen * pct;
  const color = isPass ? '#10b981' : '#ef4444';
  return (
    <svg width="128" height="108" viewBox="0 0 128 108">
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}
        strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={-circ * 0.125}
        strokeLinecap="butt" />
      <circle cx={C} cy={C} r={R} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={-circ * 0.125}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: 'stroke-dasharray 1s ease' }} />
      <text x={C} y={C - 2} textAnchor="middle" fontSize="20" fontWeight="900" fill="white"
        fontFamily="Inter, system-ui, sans-serif">{score.toFixed(1)}</text>
      <text x={C} y={C + 16} textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.3)"
        fontFamily="Inter, system-ui, sans-serif" letterSpacing="0.8">/ {max}.0 SL1</text>
    </svg>
  );
}

function AssessmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [assessment, setAssessment] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

 const loadAssessment = useCallback(async () => {
  try {
    const res = await rvsAPI.getById(id);
    setAssessment(res.data.assessment);
    setPhotos(res.data.photos || []);
  } catch (err) {
    console.error('Load assessment error:', err);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => { loadAssessment(); }, [loadAssessment]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await rvsAPI.delete(id);
        navigate('/assessments');
      } catch (err) {
        console.error('Delete assessment error:', err);
        alert('Failed to delete assessment.');
      }
    }
  };

  const handlePrint = (tableId) => {
    const printContent = document.getElementById(tableId).innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body { font-family: "Inter", sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; }
            h2 { font-size: 18px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '16px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <style>{`@keyframes _sp{to{transform:rotate(360deg)}} ._sp{width:42px;height:42px;border:3px solid rgba(99,102,241,.12);border-top:3px solid #6366f1;border-radius:50%;animation:_sp .75s linear infinite}`}</style>
      <div className="_sp" />
      <span style={{ fontSize: '.8rem', fontWeight: '600', color: '#94a3b8' }}>Loading assessment…</span>
    </div>
  );

  /* ── not found ── */
  if (!assessment) return (
    <div style={{ padding: '32px', maxWidth: '500px', margin: '100px auto', textAlign: 'center', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(99,102,241,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>
      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Assessment Not Found</h3>
      <p style={{ color: '#94a3b8', margin: '0 0 24px 0', fontSize: '.88rem' }}>This assessment record could not be located.</p>
      <button onClick={() => navigate(-1)}
        style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }}>
        ← Go Back
      </button>
    </div>
  );

  /* ── data ── */
  const a = assessment;
  const isPass = a.result === 'PASS';
  const finalScore = parseFloat(a.final_score);
  const baseScore  = parseFloat(a.base_score);
  const resultColor = isPass ? '#10b981' : '#ef4444';
  const resultGrad  = isPass ? 'linear-gradient(135deg,#10b981,#34d399)' : 'linear-gradient(135deg,#ef4444,#f87171)';

  const modifiers = [
    { label: 'Severe Vertical Irregularity',  value: parseFloat(a.mod_severe_vertical)   || 0 },
    { label: 'Moderate Vertical Irregularity', value: parseFloat(a.mod_moderate_vertical) || 0 },
    { label: 'Plan Irregularity',              value: parseFloat(a.mod_plan_irregularity) || 0 },
    { label: 'Pre-Code',                       value: parseFloat(a.mod_pre_code)          || 0 },
    { label: 'Post-Benchmark',                 value: parseFloat(a.mod_post_benchmark)    || 0 },
    { label: 'Soil Type A or B',               value: parseFloat(a.mod_soil_type_ab)      || 0 },
    { label: 'Soil Type E (1–3 stories)',       value: parseFloat(a.mod_soil_type_e_1_3)  || 0 },
    { label: 'Soil Type E (>3 stories)',        value: parseFloat(a.mod_soil_type_e_gt3)  || 0 },
  ].filter(m => m.value !== 0);

  const maxAbsMod = Math.max(...modifiers.map(m => Math.abs(m.value)), 0.1);

  /* ── sub-components ── */
  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: '500', flex: '0 0 50%' }}>{label}</span>
      <span style={{ fontSize: '.84rem', color: '#0f172a', fontWeight: '700', textAlign: 'right', flex: '0 0 48%' }}>
        {value !== null && value !== undefined && value !== ''
          ? String(value)
          : <span style={{ color: '#e2e8f0', fontWeight: '500' }}>—</span>}
      </span>
    </div>
  );

  const BoolRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: '500', flex: '0 0 62%' }}>{label}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '7px', letterSpacing: '.04em',
        background: value ? 'rgba(16,185,129,.1)' : '#f8fafc',
        color: value ? '#10b981' : '#94a3b8',
        border: `1px solid ${value ? 'rgba(16,185,129,.25)' : '#e2e8f0'}`,
      }}>
        {value
          ? <><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> YES</>
          : <><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} /> NO</>
        }
      </span>
    </div>
  );

  const SectionCard = ({ title, accent = '#6366f1', children, tableId }) => (
    <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden', marginBottom: '14px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg,${accent},transparent)` }} />
      <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #f8fafc', background: '#fafbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '.66rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>{title}</h4>
        {tableId && (
          <button 
            onClick={() => handlePrint(tableId)}
            style={{ fontSize: '0.6rem', fontWeight: '700', color: accent, background: 'none', border: `1px solid ${accent}`, padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
          >
            EXPORT TABLE
          </button>
        )}
      </div>
      <div style={{ padding: '0 20px 10px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto', fontFamily: '"Inter", system-ui, -apple-system, sans-serif', color: '#0f172a', lineHeight: 1.5, boxSizing: 'border-box' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .a-btn-back { background:white;color:#64748b;border:1px solid #e2e8f0;padding:8px 18px;border-radius:11px;font-weight:700;font-size:.82rem;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .18s; }
        .a-btn-back:hover { border-color:#6366f1;color:#6366f1; }
        .a-btn-pri { background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:11px 22px;border-radius:13px;text-decoration:none;font-weight:700;font-size:.88rem;display:flex;align-items:center;gap:9px;box-shadow:0 4px 14px rgba(99,102,241,.35);transition:transform .2s,box-shadow .2s; }
        .a-btn-pri:hover { transform:translateY(-2px);box-shadow:0 10px 24px rgba(99,102,241,.45) !important; }
        .a-btn-sec { background:white;color:#64748b;border:1px solid #e2e8f0;padding:11px 22px;border-radius:13px;text-decoration:none;font-weight:700;font-size:.88rem;display:flex;align-items:center;gap:8px;transition:all .18s; }
        .a-btn-sec:hover { border-color:#6366f1;color:#6366f1; }
        .a-btn-danger { background:white;color:#ef4444;border:1px solid #ef4444;padding:11px 22px;border-radius:13px;font-weight:700;font-size:.88rem;display:flex;align-items:center;gap:8px;transition:all .18s; cursor: pointer; }
        .a-btn-danger:hover { background:#ef4444;color:white; }
        @keyframes a-grow { from{width:0} }
        .a-bar { animation: a-grow 1.2s cubic-bezier(.34,1.1,.64,1) both; }
        @keyframes a-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .a-fu { animation: a-up .45s ease both; }
        .a-fu1{animation-delay:.05s} .a-fu2{animation-delay:.1s} .a-fu3{animation-delay:.15s}
      `}</style>

      {/* Back */}
      <button className="a-btn-back" onClick={() => navigate(-1)} style={{ marginBottom: '22px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </button>

      {/* Header */}
      <header className="a-fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              Assessment #{a.id}
            </span>
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
            <span style={{ fontSize: '.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              {new Date(a.assessment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-.04em', color: '#0f172a', lineHeight: 1.1 }}>
            {a.building_name}
          </h1>
          <p style={{ margin: 0, fontSize: '.84rem', color: '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {a.building_address}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/reports/${a.id}`} className="a-btn-pri">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            View Report
          </Link>
          {isAdmin && (
            <button className="a-btn-danger" onClick={handleDelete}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Delete Assessment
            </button>
          )}
        </div>
      </header>

      {/* ── Score Banner ── */}
      <div className="a-fu a-fu1" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)', borderRadius: '24px', padding: '32px 36px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px -12px rgba(15,23,42,.45)' }}>
        <WaveDecor />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '6px 14px', borderRadius: '10px', background: resultGrad, color: 'white', fontSize: '.72rem', fontWeight: '900', letterSpacing: '.06em', boxShadow: `0 4px 12px ${resultColor}44` }}>
                {a.result}
              </div>
              <div style={{ height: '1px', width: '30px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '.72rem', fontWeight: '600' }}>FINAL SCREENING SCORE</span>
            </div>
            <h2 style={{ color: 'white', fontSize: '2.4rem', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-.03em' }}>
              {isPass ? 'Safe to Occupy' : 'Further Action Required'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.9rem', margin: 0, maxWidth: '440px', lineHeight: 1.6 }}>
              {isPass 
                ? 'The building has achieved a score above the cutoff, indicating a low seismic risk based on the RVS criteria.'
                : 'The building score is below the cutoff. A detailed structural evaluation by a professional engineer is recommended.'}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
            <ScoreGauge score={finalScore} isPass={isPass} />
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="a-fu a-fu2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Left column */}
        <div>
          <SectionCard title="General Information" accent="#3b82f6" tableId="table1">
            <div id="table1" style={{ display: 'none' }}>
              <h2>TABLE 1: GENERAL BUILDING INFORMATION</h2>
              <table>
                <thead>
                  <tr>
                    <th>PHOTO</th><th>BUILDING NAME</th><th>ADDRESS</th><th>USE</th><th>NO. OF STORIES ABOVE</th><th>NO. OF STORIES BELOW</th><th>YEAR BUILT</th><th>TOTAL FLOOR AREA</th><th>OCCUPANCY</th><th>SOIL TYPE</th><th>GEOLOGIC HAZARDS</th><th>ADJACENCY</th><th>VERTICAL IRREGULARITY</th><th>PLAN IRREGULARITY</th><th>EXTERIOR FALLING HAZARDS</th><th>SL1</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{photos.length > 0 ? <img src={`${API_BASE_URL}${photos[0].image_url}`} alt="Building" style={{ width: '60px', height: '60px', objectFit: 'cover' }} /> : 'N/A'}</td>
                    <td>{a.building_name}</td>
                    <td>{a.building_address}</td>
                    <td>{a.use_type}</td>
                    <td>{a.stories_above}</td>
                    <td>{a.stories_below}</td>
                    <td>{a.year_built}</td>
                    <td>{a.floor_area}</td>
                    <td>{a.occupancy}</td>
                    <td>{a.soil_type}</td>
                    <td>{`Liq: ${a.geologic_liquefaction}, Land: ${a.geologic_landslide}, Surf: ${a.geologic_surf_rupt}`}</td>
                    <td>{`Pound: ${a.adjacency_pounding ? 'Yes' : 'No'}, Fall: ${a.adjacency_falling_hazards ? 'Yes' : 'No'}`}</td>
                    <td>{a.irregularity_vertical ? 'Yes' : 'No'}</td>
                    <td>{a.irregularity_plan ? 'Yes' : 'No'}</td>
                    <td>{`${a.hazard_unbraced_chimneys ? 'Chimneys ' : ''}${a.hazard_parapets ? 'Parapets ' : ''}${a.hazard_heavy_cladding ? 'Cladding ' : ''}${a.hazard_appendages ? 'Appendages' : ''}`}</td>
                    <td>{a.final_score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <InfoRow label="Building Use"      value={a.use_type} />
            <InfoRow label="Stories Above"     value={a.stories_above} />
            <InfoRow label="Stories Below"     value={a.stories_below} />
            <InfoRow label="Year Built"        value={a.year_built} />
            <InfoRow label="Total Floor Area"  value={a.floor_area ? `${a.floor_area} sq.ft.` : null} />
            <InfoRow label="Occupancy"         value={a.occupancy} />
            <InfoRow label="Soil Type"         value={a.soil_type} />
          </SectionCard>

          <SectionCard title="Score Calculation" accent="#6366f1">
            <div style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '.82rem', color: '#94a3b8', fontWeight: '500' }}>Base Score ({a.building_type})</span>
                <span style={{ fontSize: '.84rem', color: '#0f172a', fontWeight: '700' }}>{baseScore.toFixed(1)}</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                <div className="a-bar" style={{ height: '100%', width: `${(baseScore/5)*100}%`, background: '#cbd5e1', borderRadius: '10px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '10px' }}>Score Modifiers</span>
                {modifiers.length > 0 ? modifiers.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ flex: 1, fontSize: '.78rem', color: '#475569', fontWeight: '500' }}>{m.label}</div>
                    <div style={{ width: '100px', height: '4px', background: '#f8fafc', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                      <div className="a-bar" style={{ 
                        position: 'absolute',
                        left: m.value > 0 ? '50%' : `${50 - (Math.abs(m.value)/maxAbsMod)*50}%`,
                        width: `${(Math.abs(m.value)/maxAbsMod)*50}%`,
                        height: '100%',
                        background: m.value > 0 ? '#10b981' : '#ef4444',
                        borderRadius: '10px'
                      }} />
                    </div>
                    <div style={{ width: '35px', textAlign: 'right', fontSize: '.78rem', fontWeight: '700', color: m.value > 0 ? '#10b981' : '#ef4444' }}>
                      {m.value > 0 ? `+${m.value.toFixed(1)}` : m.value.toFixed(1)}
                    </div>
                  </div>
                )) : <div style={{ fontSize: '.78rem', color: '#cbd5e1', fontStyle: 'italic' }}>No modifiers applied</div>}
              </div>

              <div style={{ padding: '16px', background: isPass ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', borderRadius: '16px', border: `1px dashed ${isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '.82rem', fontWeight: '700', color: '#475569' }}>Final Score (SL1)</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', color: resultColor }}>{finalScore.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: resultColor, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: '.72rem', fontWeight: '700', color: resultColor }}>
                    {isPass ? 'SL1 ≥ 2.0 — Screening passed, no further action required.' : 'SL1 < 2.0 — Detailed structural evaluation is required.'}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div>
          <SectionCard title="Structural Conditions" accent="#8b5cf6">
            <BoolRow label="Vertical Irregularity"        value={a.irregularity_vertical} />
            {a.irregularity_vertical_type && <InfoRow label="Vertical Type" value={a.irregularity_vertical_type} />}
            <BoolRow label="Plan Irregularity"            value={a.irregularity_plan} />
            {a.irregularity_plan_type && <InfoRow label="Plan Type" value={a.irregularity_plan_type} />}
            <BoolRow label="Adjacency Pounding"           value={a.adjacency_pounding} />
            <BoolRow label="Falling Hazards (Adjacency)"  value={a.adjacency_falling_hazards} />
          </SectionCard>

          <SectionCard title="Geologic Hazards" accent="#f59e0b" tableId="table3">
            <div id="table3" style={{ display: 'none' }}>
              <h2>TABLE 3: OTHER HAZARD</h2>
              <table>
                <thead>
                  <tr>
                    <th>BUILDING NAME</th><th>POUNDING</th><th>FALLING HAZARD</th><th>GEOLOGIC HAZARD</th><th>SIGNIFICANT DAMAGE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{a.building_name}</td>
                    <td>{a.adjacency_pounding ? 'Yes' : 'No'}</td>
                    <td>{a.adjacency_falling_hazards ? 'Yes' : 'No'}</td>
                    <td>{`Liq: ${a.geologic_liquefaction}, Land: ${a.geologic_landslide}, Surf: ${a.geologic_surf_rupt}`}</td>
                    <td>N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <InfoRow label="Liquefaction"   value={String(a.geologic_liquefaction).toUpperCase()} />
            <InfoRow label="Landslide"      value={String(a.geologic_landslide).toUpperCase()} />
            <InfoRow label="Surface Rupture" value={String(a.geologic_surf_rupt).toUpperCase()} />
          </SectionCard>

          <SectionCard title="Exterior Falling Hazards" accent="#ef4444">
            <BoolRow label="Unbraced Chimneys"      value={a.hazard_unbraced_chimneys} />
            <BoolRow label="Parapets"                value={a.hazard_parapets} />
            <BoolRow label="Heavy Cladding / Veneer" value={a.hazard_heavy_cladding} />
            <BoolRow label="Appendages"              value={a.hazard_appendages} />
            {a.hazard_other && <InfoRow label="Other" value={a.hazard_other} />}
          </SectionCard>

          <SectionCard title="Extent of Review" accent="#10b981" tableId="table2">
            <div id="table2" style={{ display: 'none' }}>
              <h2>TABLE 2: EXTENT OF REVIEW</h2>
              <table>
                <thead>
                  <tr>
                    <th>BUILDING NAME</th><th>EXTERIOR</th><th>INTERIOR</th><th>DRAWING REVIEWED</th><th>SOIL TYPE SOURCE</th><th>GEOLOGIC HAZARD SOURCE</th><th>CONTACT PERSON</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{a.building_name}</td>
                    <td>{a.exterior_review}</td>
                    <td>{a.interior_review}</td>
                    <td>{a.drawings_reviewed ? 'Yes' : 'No'}</td>
                    <td>{a.soil_source}</td>
                    <td>{a.geologic_source}</td>
                    <td>{a.contact_person || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <InfoRow label="Exterior Review"   value={a.exterior_review?.replace('_', ' ')} />
            <InfoRow label="Interior Review"   value={a.interior_review} />
            <BoolRow label="Drawings Reviewed" value={a.drawings_reviewed} />
            <InfoRow label="Soil Source"       value={a.soil_source} />
            <InfoRow label="Geologic Source"   value={a.geologic_source} />
          </SectionCard>

          <SectionCard title="Action Required" accent="#0f172a" tableId="table4">
            <div id="table4" style={{ display: 'none' }}>
              <h2>TABLE 4: ACTION REQUIRED</h2>
              <table>
                <thead>
                  <tr>
                    <th rowSpan="2">BUILDING NAME</th>
                    <th colSpan="4">DETAILED STRUCTURAL EVALUATION</th>
                    <th colSpan="4">DETAILED NONSTRUCTURAL EVALUATION</th>
                  </tr>
                  <tr>
                    <th>YES, UNKNOWN FEMA BUILDING TYPE</th>
                    <th>YES, SCORE LESS THAN CUT-OFF</th>
                    <th>YES, OTHER HAZARDS PRESENT</th>
                    <th>NO</th>
                    <th>YES, NONSTRUCTURAL HAZARDS IDENTIFIED THAT SHOULD BE EVALUATED</th>
                    <th>NO, NONSTRUCTURAL HAZARDS EXIST THAT MAY REQUIRE MITIGATION</th>
                    <th>NO, NO NONSTRUCTURAL HAZARDS IDENTIFIED</th>
                    <th>DNK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{a.building_name}</td>
                    <td>No</td>
                    <td>{a.result === 'FAIL' ? 'Yes' : 'No'}</td>
                    <td>No</td>
                    <td>{a.result === 'PASS' ? 'Yes' : 'No'}</td>
                    <td>{(a.hazard_unbraced_chimneys || a.hazard_parapets || a.hazard_heavy_cladding || a.hazard_appendages) ? 'Yes' : 'No'}</td>
                    <td>No</td>
                    <td>{!(a.hazard_unbraced_chimneys || a.hazard_parapets || a.hazard_heavy_cladding || a.hazard_appendages) ? 'Yes' : 'No'}</td>
                    <td>No</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <InfoRow label="Structural Eval" value={a.result === 'FAIL' ? 'Required' : 'Not Required'} />
            <InfoRow label="Nonstructural Eval" value={(a.hazard_unbraced_chimneys || a.hazard_parapets || a.hazard_heavy_cladding || a.hazard_appendages) ? 'Recommended' : 'Not Required'} />
          </SectionCard>
        </div>
      </div>

      {/* Comments */}
      {a.comments && (
        <div className="a-fu a-fu3" style={{ background: 'white', borderRadius: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden', marginBottom: '22px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6,transparent)' }} />
          <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #f8fafc', background: '#fafbff' }}>
            <h4 style={{ margin: 0, fontSize: '.66rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>Viewer Comments</h4>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '.88rem', color: '#374151', lineHeight: 1.75, borderLeft: '3px solid #e2e8f0', paddingLeft: '14px' }}>{a.comments}</p>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to={`/reports/${a.id}`} className="a-btn-pri">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          View Full Report
        </Link>
        <Link to="/assessments" className="a-btn-sec">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Assessments
        </Link>
      </div>
    </div>
  );
}

export default AssessmentDetailPage;
