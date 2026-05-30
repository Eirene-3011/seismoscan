import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildingAPI, rvsAPI } from '../utils/api';

const BUILDING_TYPES = [
  { value: 'DNK', label: 'DNK - Do Not Know' },
  { value: 'W1', label: 'W1 - Wood Light Frame' },
  { value: 'W1A', label: 'W1A - Multi-Family Wood' },
  { value: 'W2', label: 'W2 - Commercial Wood' },
  { value: 'S1', label: 'S1 - Steel Moment Frame (MRF)' },
  { value: 'S2', label: 'S2 - Steel Braced Frame (BR)' },
  { value: 'S3', label: 'S3 - Steel Light Frame (LM)' },
  { value: 'S4', label: 'S4 - Steel Frame w/ Concrete (RC SW)' },
  { value: 'S5', label: 'S5 - Steel Frame w/ Infill (URM INF)' },
  { value: 'C1', label: 'C1 - Concrete Moment Frame (MRF)' },
  { value: 'C2', label: 'C2 - Concrete Shear Wall (SW)' },
  { value: 'C3', label: 'C3 - Concrete Frame w/ Infill (URM INF)' },
  { value: 'PC1', label: 'PC1 - Precast Concrete Tilt-Up (TU)' },
  { value: 'PC2', label: 'PC2 - Precast Concrete Frame (INF)' },
  { value: 'RM1', label: 'RM1 - Reinforced Masonry (FD)' },
  { value: 'RM2', label: 'RM2 - Reinforced Masonry (RD)' },
  { value: 'URM', label: 'URM - Unreinforced Masonry' },
  { value: 'MH', label: 'MH - Manufactured Housing' },
];

const SOIL_TYPES = [
  { value: 'DNK', label: 'DNK - Do Not Know (assume Type D)' },
  { value: 'A', label: 'A - Hard Rock' },
  { value: 'B', label: 'B - Average Rock' },
  { value: 'C', label: 'C - Dense Soil' },
  { value: 'D', label: 'D - Stiff Soil' },
  { value: 'E', label: 'E - Soft Soil' },
  { value: 'F', label: 'F - Poor Soil (requires special evaluation)' },
];

const OCCUPANCIES = ['Assembly', 'Commercial', 'Emergency Services', 'Historic', 'Shelter', 'Industrial', 'Office', 'School', 'Government', 'Utility', 'Warehouse', 'Residential'];

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

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: `1px solid ${colors.border}`,
  fontSize: '0.875rem',
  color: colors.text,
  backgroundColor: 'white',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

// Sub-components moved outside to prevent remounting on every state change
const SectionCard = ({ title, children }) => (
  <div style={{ backgroundColor: colors.surface, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '16px' }}>
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
      <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </h4>
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

const FormRow = ({ children, cols = 2 }) => (
  <div className={cols === 3 ? 'form-grid-3' : 'form-grid-2'}>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}{required && <span style={{ color: colors.danger, marginLeft: '3px' }}>*</span>}
    </label>
    {children}
  </div>
);

const CheckboxField = ({ name, label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0', borderBottom: `1px solid #f8fafc` }}>
    <div style={{
      width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
      border: `2px solid ${checked ? colors.primary : colors.border}`,
      backgroundColor: checked ? colors.primary : 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s ease',
    }}>
      {checked && <span style={{ color: 'white', fontSize: '11px', fontWeight: '900', lineHeight: 1 }}>✓</span>}
    </div>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ display: 'none' }} />
    <span style={{ fontSize: '0.875rem', color: checked ? colors.text : colors.textMuted, fontWeight: checked ? '600' : '400' }}>
      {label}
    </span>
  </label>
);

function NewAssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillBuildingId = searchParams.get('building_id');

  const [buildings, setBuildings] = useState([]);
  const [liveScore, setLiveScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    building_id: prefillBuildingId || '',
    assessment_date: new Date().toISOString().split('T')[0],
    building_type: 'DNK',
    soil_type: 'DNK',
    occupancy: '',
    exterior_review: 'all_sides',
    interior_review: 'none',
    drawings_reviewed: 'no',
    soil_source: '',
    geologic_source: '',
    contact_person: '',
    geologic_liquefaction: 'dnk',
    geologic_landslide: 'dnk',
    geologic_surf_rupt: 'dnk',
    adjacency_pounding: false,
    adjacency_falling_hazards: false,
    irregularity_vertical: false,
    irregularity_severe_vertical: false,
    irregularity_moderate_vertical: false,
    irregularity_vertical_type: '',
    irregularity_plan: false,
    irregularity_plan_type: '',
    hazard_unbraced_chimneys: false,
    hazard_parapets: false,
    hazard_heavy_cladding: false,
    hazard_appendages: false,
    hazard_other: '',
    additions_none: true,
    additions_yes: '',
    other_hazard_pounding: false,
    other_hazard_falling: false,
    other_hazard_geologic: false,
    other_hazard_damage: false,
    action_structural_yes: false,
    action_structural_no: false,
    action_nonstructural_yes: false,
    action_nonstructural_no: false,
    action_nonstructural_dnk: false,
    level2_performed: false,
    level2_score: '',
    level2_nonstructural: '',
    comments: '',
  });
const loadBuildings = useCallback(async () => {
  try {
    const res = await buildingAPI.getAll({ limit: 200 });
    setBuildings(res.data.buildings || []);
  } catch (err) {
    console.error('Load buildings error:', err);
  }
}, []);

const computeLiveScore = useCallback(async () => {
  try {
    const building = buildings.find(b => String(b.id) === String(form.building_id));
    const res = await rvsAPI.computeScore({
      building_type: form.building_type,
      soil_type: form.soil_type,
      irregularity_vertical: form.irregularity_vertical,
      irregularity_plan: form.irregularity_plan,
      irregularity_severe_vertical: form.irregularity_severe_vertical,
      irregularity_moderate_vertical: form.irregularity_moderate_vertical,
      year_built: building?.year_built,
      stories_above: building?.stories_above,
    });
    setLiveScore(res.data);
  } catch (err) {
    // silently fail for live score
  }
}, [
  buildings,
  form.building_id,
  form.building_type,
  form.soil_type,
  form.irregularity_vertical,
  form.irregularity_plan,
  form.irregularity_severe_vertical,
  form.irregularity_moderate_vertical,
]);

useEffect(() => { loadBuildings(); }, [loadBuildings]);

useEffect(() => {
  if (form.building_id && form.building_type) {
    computeLiveScore();
  }
}, [computeLiveScore, form.building_id, form.building_type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await rvsAPI.create(form);
      navigate(`/assessments/${res.data.assessment.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assessment.');
      setLoading(false);
    }
  };

  const isPass = liveScore?.result === 'PASS';

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
        .form-input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
        .btn-premium { transition: all 0.2s ease; cursor: pointer; }
        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(37,99,235,0.2); }
        .btn-premium:active { transform: translateY(0); }
        .btn-ghost { transition: all 0.2s ease; cursor: pointer; }
        .btn-ghost:hover { background-color: #f8fafc !important; border-color: #2563eb !important; color: #2563eb !important; }
        .progress-fill { transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>

      {/* Back */}
      <button
        className="btn-ghost"
        onClick={() => navigate(-1)}
        style={{ backgroundColor: 'white', color: colors.textMuted, border: `1px solid ${colors.border}`, padding: '9px 18px', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: '28px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back
      </button>

      {/* Page Header */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.04em', color: colors.brand }}>
          New RVS Assessment
        </h1>
        <p style={{ fontSize: '1rem', color: colors.textMuted, margin: 0, fontWeight: '500' }}>
          FEMA P-154 Rapid Visual Screening Form
        </p>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: '600', backgroundColor: colors.dangerGlow, color: colors.danger, border: `1px solid rgba(239,68,68,0.2)` }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="assessment-layout">

          {/* ── LEFT: Form sections ── */}
          <div>

            {/* 1. Building & Inspector */}
            <SectionCard title="Building & Inspector Information">
              <FormRow cols={2}>
                <Field label="Building" required>
                  <select name="building_id" className="form-input" value={form.building_id} onChange={handleChange} required style={inputStyle}>
                    <option value="">— Select Building —</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name} — {b.address}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Assessment Date" required>
                  <input type="date" name="assessment_date" className="form-input" value={form.assessment_date} onChange={handleChange} required style={inputStyle} />
                </Field>
              </FormRow>
              <FormRow cols={2}>
                <Field label="Occupancy">
                  <select name="occupancy" className="form-input" value={form.occupancy} onChange={handleChange} style={inputStyle}>
                    <option value="">Select occupancy</option>
                    {OCCUPANCIES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Contact Person">
                  <input type="text" name="contact_person" className="form-input" value={form.contact_person} onChange={handleChange} placeholder="On-site contact name" style={inputStyle} />
                </Field>
              </FormRow>
            </SectionCard>

            {/* 2. Building Type & Soil */}
            <SectionCard title="Building Type & Soil Classification">
              <FormRow cols={2}>
                <Field label="FEMA Building Type" required>
                  <select name="building_type" className="form-input" value={form.building_type} onChange={handleChange} required style={inputStyle}>
                    {BUILDING_TYPES.map(bt => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Soil Type">
                  <select name="soil_type" className="form-input" value={form.soil_type} onChange={handleChange} style={inputStyle}>
                    {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              </FormRow>
              <FormRow cols={2}>
                <Field label="Soil Type Source">
                  <input type="text" name="soil_source" className="form-input" value={form.soil_source} onChange={handleChange} placeholder="e.g. State Geologist" style={inputStyle} />
                </Field>
                <Field label="Geologic Hazards Source">
                  <input type="text" name="geologic_source" className="form-input" value={form.geologic_source} onChange={handleChange} placeholder="e.g. State Geologist" style={inputStyle} />
                </Field>
              </FormRow>
            </SectionCard>

            {/* 3. Geologic Hazards */}
            <SectionCard title="Geologic Hazards">
              <FormRow cols={3}>
                <Field label="Liquefaction">
                  <select name="geologic_liquefaction" className="form-input" value={form.geologic_liquefaction} onChange={handleChange} style={inputStyle}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="dnk">DNK</option>
                  </select>
                </Field>
                <Field label="Landslide">
                  <select name="geologic_landslide" className="form-input" value={form.geologic_landslide} onChange={handleChange} style={inputStyle}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="dnk">DNK</option>
                  </select>
                </Field>
                <Field label="Surface Rupture">
                  <select name="geologic_surf_rupt" className="form-input" value={form.geologic_surf_rupt} onChange={handleChange} style={inputStyle}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="dnk">DNK</option>
                  </select>
                </Field>
              </FormRow>
            </SectionCard>

            {/* 4. Adjacency */}
            <SectionCard title="Adjacency Conditions">
              <CheckboxField name="adjacency_pounding" label="Pounding Risk from Adjacent Building" checked={form.adjacency_pounding} onChange={handleChange} />
              <CheckboxField name="adjacency_falling_hazards" label="Falling Hazards from Taller Adjacent Building" checked={form.adjacency_falling_hazards} onChange={handleChange} />
            </SectionCard>

            {/* 5. Structural Irregularities */}
            <SectionCard title="Structural Irregularities">
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Vertical Irregularity</p>
                <CheckboxField name="irregularity_vertical" label="Vertical Irregularity Present" checked={form.irregularity_vertical} onChange={handleChange} />
                {form.irregularity_vertical && (
                  <div style={{ paddingLeft: '28px', marginTop: '8px', borderLeft: `2px solid ${colors.primaryGlow}` }}>
                    <CheckboxField name="irregularity_severe_vertical" label="Severe Vertical Irregularity (V1s)" checked={form.irregularity_severe_vertical} onChange={handleChange} />
                    <CheckboxField name="irregularity_moderate_vertical" label="Moderate Vertical Irregularity (V1m)" checked={form.irregularity_moderate_vertical} onChange={handleChange} />
                    <div style={{ marginTop: '12px' }}>
                      <input type="text" name="irregularity_vertical_type" className="form-input" value={form.irregularity_vertical_type} onChange={handleChange} placeholder="Describe type / severity" style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Plan Irregularity</p>
                <CheckboxField name="irregularity_plan" label="Plan Irregularity Present" checked={form.irregularity_plan} onChange={handleChange} />
                {form.irregularity_plan && (
                  <div style={{ paddingLeft: '28px', marginTop: '8px', borderLeft: `2px solid ${colors.primaryGlow}` }}>
                    <input type="text" name="irregularity_plan_type" className="form-input" value={form.irregularity_plan_type} onChange={handleChange} placeholder="e.g. Reentrant corner (L-shaped)" style={{ ...inputStyle, marginTop: '8px' }} />
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 6. Exterior Falling Hazards */}
            <SectionCard title="Exterior Falling Hazards">
              <div className="form-grid-2" style={{ gap: '0 24px' }}>
                <CheckboxField name="hazard_unbraced_chimneys" label="Unbraced Chimneys" checked={form.hazard_unbraced_chimneys} onChange={handleChange} />
                <CheckboxField name="hazard_heavy_cladding" label="Heavy Cladding or Heavy Veneer" checked={form.hazard_heavy_cladding} onChange={handleChange} />
                <CheckboxField name="hazard_parapets" label="Parapets" checked={form.hazard_parapets} onChange={handleChange} />
                <CheckboxField name="hazard_appendages" label="Appendages" checked={form.hazard_appendages} onChange={handleChange} />
              </div>
              <div style={{ marginTop: '16px' }}>
                <Field label="Other Hazards">
                  <input type="text" name="hazard_other" className="form-input" value={form.hazard_other} onChange={handleChange} placeholder="Describe other hazards" style={inputStyle} />
                </Field>
              </div>
            </SectionCard>

            {/* 7. Extent of Review */}
            <SectionCard title="Extent of Review">
              <FormRow cols={2}>
                <Field label="Exterior Review">
                  <select name="exterior_review" className="form-input" value={form.exterior_review} onChange={handleChange} style={inputStyle}>
                    <option value="partial">Partial</option>
                    <option value="all_sides">All Sides</option>
                    <option value="aerial">Aerial</option>
                  </select>
                </Field>
                <Field label="Interior Review">
                  <select name="interior_review" className="form-input" value={form.interior_review} onChange={handleChange} style={inputStyle}>
                    <option value="none">None</option>
                    <option value="visible">Visible</option>
                    <option value="entered">Entered</option>
                  </select>
                </Field>
              </FormRow>
              <Field label="Drawings Reviewed?">
                <select name="drawings_reviewed" className="form-input" value={form.drawings_reviewed} onChange={handleChange} style={{ ...inputStyle, width: 'auto', minWidth: '200px' }}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
            </SectionCard>

            {/* 8. Other Hazards */}
            <SectionCard title="Other Hazards (Trigger Detailed Structural Evaluation)">
              <CheckboxField name="other_hazard_pounding" label="Pounding potential (unless SL2 > cut-off, if known)" checked={form.other_hazard_pounding} onChange={handleChange} />
              <CheckboxField name="other_hazard_falling" label="Falling hazards from taller adjacent building" checked={form.other_hazard_falling} onChange={handleChange} />
              <CheckboxField name="other_hazard_geologic" label="Geologic hazards or Soil Type F" checked={form.other_hazard_geologic} onChange={handleChange} />
              <CheckboxField name="other_hazard_damage" label="Significant damage / deterioration to the structural system" checked={form.other_hazard_damage} onChange={handleChange} />
            </SectionCard>

            {/* 9. Comments */}
            <SectionCard title="Comments">
              <textarea
                name="comments"
                className="form-input"
                rows={4}
                value={form.comments}
                onChange={handleChange}
                placeholder="Additional notes, observations, or field comments…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </SectionCard>
          </div>

          {/* ── RIGHT: Sticky Score Sidebar ── */}
          <div style={{ position: 'sticky', top: '84px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Live Score Panel */}
            {liveScore ? (
              <div style={{ backgroundColor: colors.brand, borderRadius: '24px', padding: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${isPass ? colors.success : colors.danger} 0%, transparent 70%)`, opacity: 0.2, pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
                    FEMA P-154 Live Preview
                  </div>
                  <div style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: 1, marginBottom: '4px' }}>
                    {liveScore.final_score.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.5, marginBottom: '20px' }}>Final Level 1 Score (SL1)</div>

                  {/* Progress bar */}
                  <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div className="progress-fill" style={{ height: '100%', width: `${Math.min((liveScore.final_score / 5) * 100, 100)}%`, background: `linear-gradient(90deg, ${isPass ? colors.success : colors.danger}, ${isPass ? '#34d399' : '#f87171'})`, borderRadius: '6px' }}></div>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: isPass ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${isPass ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '8px 16px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isPass ? colors.success : colors.danger, boxShadow: `0 0 8px ${isPass ? colors.success : colors.danger}` }}></div>
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: isPass ? colors.success : colors.danger }}>{liveScore.result}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.5, marginTop: '10px' }}>
                    {isPass ? 'SL1 ≥ 2.0 — No Level 2 required' : 'SL1 < 2.0 — Level 2 Evaluation Required'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: colors.surface, borderRadius: '24px', border: `1px solid ${colors.border}`, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '12px' }}>📊</div>
                <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
                  Select a building and building type to see the live score preview
                </p>
              </div>
            )}

            {/* Score Breakdown */}
            {liveScore && (
              <div style={{ backgroundColor: colors.surface, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
                  <h4 style={{ margin: 0, fontSize: '0.72rem', fontWeight: '800', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score Breakdown</h4>
                </div>
                <div style={{ padding: '0 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '500' }}>Base Score</span>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: colors.brand }}>{liveScore.base_score.toFixed(1)}</span>
                  </div>
                  {Object.entries(liveScore.modifiers).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '500' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '800', color: val < 0 ? colors.danger : colors.success }}>
                        {val >= 0 ? '+' : ''}{val.toFixed(1)}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: `2px solid ${colors.border}` }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '800', color: colors.brand }}>SL1 Final Score</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '900', color: isPass ? colors.success : colors.danger }}>{liveScore.final_score.toFixed(1)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 14px 0' }}>
                    <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '500' }}>Minimum Score</span>
                    <span style={{ fontSize: '0.875rem', color: colors.textMuted, fontWeight: '600' }}>{liveScore.min_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              type="submit"
              className="btn-premium"
              disabled={loading}
              onClick={handleSubmit}
              style={{
                width: '100%', backgroundColor: loading ? '#94a3b8' : colors.primary,
                color: 'white', border: 'none',
                padding: '14px 20px', borderRadius: '14px',
                fontWeight: '700', fontSize: '1rem', fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving Assessment…' : 'Save Assessment'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate(-1)}
              style={{
                width: '100%', backgroundColor: 'white', color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                padding: '12px 20px', borderRadius: '14px',
                fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NewAssessmentPage;
