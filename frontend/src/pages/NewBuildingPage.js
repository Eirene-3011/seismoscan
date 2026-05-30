import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildingAPI } from '../utils/api';

const USE_TYPES = ['Assembly', 'Commercial', 'Emergency Services', 'Historic', 'Shelter', 'Industrial', 'Office', 'School', 'Government', 'Utility', 'Warehouse', 'Residential', 'Other'];

const colors = {
  brand: '#0f172a',
  primary: '#2563eb',
  primaryGlow: 'rgba(37, 99, 235, 0.1)',
  success: '#10b981',
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
};

const Field = ({ label, required, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}{required && <span style={{ color: colors.danger, marginLeft: '3px' }}>*</span>}
    </label>
    {children}
    {hint && <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{hint}</span>}
  </div>
);

const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 20px 0' }}>
    <div style={{ height: '1px', flex: 1, backgroundColor: colors.border }}></div>
    <span style={{ fontSize: '0.68rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    <div style={{ height: '1px', flex: 1, backgroundColor: colors.border }}></div>
  </div>
);

function NewBuildingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', address: '', use_type: '', latitude: '', longitude: '',
    stories_above: '', stories_below: '', year_built: '', floor_area: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await buildingAPI.create(form);
      navigate(`/buildings/${res.data.building.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create building.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '32px',
      maxWidth: '860px',
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
      `}</style>

      {/* Back */}
      <button
        className="btn-ghost"
        onClick={() => navigate(-1)}
        style={{ backgroundColor: 'white', color: colors.textMuted, border: `1px solid ${colors.border}`, padding: '9px 18px', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: '28px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back
      </button>

      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.04em', color: colors.brand }}>
          Add New Building
        </h1>
        <p style={{ fontSize: '1rem', color: colors.textMuted, margin: 0, fontWeight: '500' }}>
          Enter building information for RVS assessment
        </p>
      </header>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: '600', backgroundColor: colors.dangerGlow, color: colors.danger, border: `1px solid rgba(239,68,68,0.2)` }}>
          {error}
        </div>
      )}

      {/* Form Card */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '28px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '800', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Building Information
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>

          {/* Identity */}
          <div className="form-grid-2">
            <Field label="Building Name" required>
              <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Enter building name" required style={inputStyle} />
            </Field>
            <Field label="Use Type">
              <select name="use_type" className="form-input" value={form.use_type} onChange={handleChange} style={inputStyle}>
                <option value="">Select use type</option>
                {USE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Field label="Full Address" required>
              <input type="text" name="address" className="form-input" value={form.address} onChange={handleChange} placeholder="Street, City, ZIP" required style={inputStyle} />
            </Field>
          </div>

          <Divider label="Location" />

          <div className="form-grid-2" style={{ marginBottom: '24px' }}>
            <Field label="Latitude (GPS)" hint="Decimal degrees, e.g. 10.3157">
              <input type="number" name="latitude" className="form-input" value={form.latitude} onChange={handleChange} placeholder="e.g. 10.3157" step="any" style={inputStyle} />
            </Field>
            <Field label="Longitude (GPS)" hint="Decimal degrees, e.g. 123.8854">
              <input type="number" name="longitude" className="form-input" value={form.longitude} onChange={handleChange} placeholder="e.g. 123.8854" step="any" style={inputStyle} />
            </Field>
          </div>

          <Divider label="Physical Characteristics" />

          <div className="form-grid-3">
            <Field label="Stories Above Grade">
              <input type="number" name="stories_above" className="form-input" value={form.stories_above} onChange={handleChange} placeholder="e.g. 3" min="0" style={inputStyle} />
            </Field>
            <Field label="Stories Below Grade">
              <input type="number" name="stories_below" className="form-input" value={form.stories_below} onChange={handleChange} placeholder="e.g. 1" min="0" style={inputStyle} />
            </Field>
            <Field label="Year Built (EST)">
              <input type="number" name="year_built" className="form-input" value={form.year_built} onChange={handleChange} placeholder="e.g. 1995" min="1800" max={new Date().getFullYear()} style={inputStyle} />
            </Field>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <Field label="Total Floor Area (sq. ft.)">
              <input type="number" name="floor_area" className="form-input" value={form.floor_area} onChange={handleChange} placeholder="e.g. 10200" min="0" step="any" style={{ ...inputStyle, maxWidth: '320px' }} />
            </Field>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: `1px solid ${colors.border}` }}>
            <button
              type="submit"
              className="btn-premium"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#94a3b8' : colors.primary,
                color: 'white', border: 'none',
                padding: '12px 28px', borderRadius: '12px',
                fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving…' : 'Save Building'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate('/buildings')}
              style={{
                backgroundColor: 'white', color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                padding: '12px 24px', borderRadius: '12px',
                fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewBuildingPage;
