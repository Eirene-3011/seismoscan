import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { buildingAPI, photoAPI } from '../utils/api';
import { API_BASE_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function BuildingDetailPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
const loadBuilding = useCallback(async () => {
  try {
    const res = await buildingAPI.getById(id);
    setBuilding(res.data.building);
    setAssessments(res.data.assessments || []);
    setPhotos(res.data.photos || []);
  } catch (err) {
    console.error('Load building error:', err);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => { loadBuilding(); }, [loadBuilding]);



  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('building_id', id);
      await photoAPI.upload(formData);
      setUploadMsg('Photo uploaded successfully!');
      setPhotoFile(null);
      loadBuilding();
    } catch (err) {
      setUploadMsg(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loader-ring"></div>
        <style>{`
          .loader-ring { width: 48px; height: 48px; border: 4px solid rgba(37,99,235,0.1); border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4,0,0.2,1) infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!building) {
    return (
      <div style={{ padding: '32px', maxWidth: '600px', margin: '80px auto', textAlign: 'center', fontFamily: '"Inter", system-ui, sans-serif' }}>
        <div style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '16px' }}>🏢</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: colors.brand, margin: '0 0 8px 0' }}>Building Not Found</h3>
        <p style={{ color: colors.textMuted, margin: '0 0 24px 0' }}>This building record could not be located.</p>
        <button onClick={() => navigate(-1)} style={{ backgroundColor: colors.brand, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: '500', flex: '0 0 50%' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: colors.text, fontWeight: '600', textAlign: 'right', flex: '0 0 46%' }}>
        {value !== null && value !== undefined && value !== '' ? value : <span style={{ color: colors.border }}>N/A</span>}
      </span>
    </div>
  );

  const SectionCard = ({ title, action, children }) => (
    <div style={{ backgroundColor: colors.surface, borderRadius: '24px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '20px' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '800', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </h4>
        {action}
      </div>
      <div style={{ padding: '4px 24px 16px 24px' }}>{children}</div>
    </div>
  );

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
        .table-row { transition: background-color 0.15s ease; border-bottom: 1px solid #f1f5f9; }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background-color: #f8fafc; }
        .photo-thumb { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .photo-thumb:hover { transform: scale(1.04); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        .file-input-label { transition: border-color 0.2s ease, background-color 0.2s ease; }
        .file-input-label:hover { border-color: #2563eb; background-color: rgba(37,99,235,0.04); }
        .loader-ring { width: 48px; height: 48px; border: 4px solid rgba(37,99,235,0.1); border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4,0,0.2,1) infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.04em', color: colors.brand }}>
            {building.name}
          </h1>
          <p style={{ fontSize: '0.95rem', color: colors.textMuted, margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.6 }}>📍</span> {building.address}
          </p>
        </div>
        {isAdmin && (
          <Link
            to={`/assessments/new?building_id=${id}`}
            className="btn-premium"
            style={{ backgroundColor: colors.success, color: 'white', padding: '12px 24px', borderRadius: '14px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 0 }}>+</span> New Assessment
          </Link>
        )}
      </header>

      {/* Top two-column row */}
      <div className="form-grid-2" style={{ gap: '20px', marginBottom: '20px' }}>

        {/* Building Details */}
        <SectionCard title="Building Details">
          <InfoRow label="Use Type" value={building.use_type} />
          <InfoRow label="Stories Above Grade" value={building.stories_above || 0} />
          <InfoRow label="Stories Below Grade" value={building.stories_below || 0} />
          <InfoRow label="Year Built" value={building.year_built || 'Unknown'} />
          <InfoRow label="Floor Area" value={building.floor_area ? `${Number(building.floor_area).toLocaleString()} sq. ft.` : null} />
          <InfoRow label="GPS Latitude" value={building.latitude} />
          <InfoRow label="GPS Longitude" value={building.longitude} />
          <InfoRow label="Added By" value={building.created_by_name} />
        </SectionCard>

        {/* Photos */}
        <div style={{ backgroundColor: colors.surface, borderRadius: '24px', border: `1px solid ${colors.border}`, overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa' }}>
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '800', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Photos
            </h4>
          </div>
          <div style={{ padding: '20px 24px' }}>

            {/* Upload form */}
            {isAdmin ? (
              <form onSubmit={handlePhotoUpload}>
                <label className="file-input-label" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${photoFile ? colors.primary : colors.border}`,
                  backgroundColor: photoFile ? colors.primaryGlow : '#fafafa',
                  borderRadius: '16px', padding: '24px 16px', cursor: 'pointer',
                  marginBottom: '14px', textAlign: 'center',
                }}>
                  <span style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.4 }}>📷</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: photoFile ? colors.primary : colors.textMuted }}>
                    {photoFile ? photoFile.name : 'Click to select a photo'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '4px' }}>
                    {photoFile ? `Ready to upload` : 'PNG, JPG, WEBP supported'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </label>

                {uploadMsg && (
                  <div style={{
                    padding: '10px 16px', borderRadius: '10px', marginBottom: '12px',
                    fontSize: '0.85rem', fontWeight: '600',
                    backgroundColor: uploadMsg.includes('success') ? colors.successGlow : colors.dangerGlow,
                    color: uploadMsg.includes('success') ? colors.success : colors.danger,
                    border: `1px solid ${uploadMsg.includes('success') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                    {uploadMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-premium"
                  disabled={!photoFile || uploading}
                  style={{
                    width: '100%', backgroundColor: photoFile ? colors.primary : '#e2e8f0',
                    color: photoFile ? 'white' : colors.textMuted,
                    border: 'none', padding: '11px 20px', borderRadius: '12px',
                    fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit',
                    cursor: photoFile ? 'pointer' : 'not-allowed',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>
                Only admins can upload photos.
              </div>
            )}

            {/* Photo grid */}
            {photos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginTop: '20px' }}>
                {photos.map(p => (
                  <div key={p.id} className="photo-thumb" style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                    <img
                      src={p.image_url}
                      alt={p.caption || 'Building photo'}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0 8px 0' }}>
                <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: 0 }}>No photos uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '32px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px 36px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: colors.brand }}>
              Assessment History
            </h3>
            <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: '4px 0 0 0' }}>
              {assessments.length} screening{assessments.length !== 1 ? 's' : ''} recorded for this building
            </p>
          </div>
          <Link
            to={`/assessments/new?building_id=${id}`}
            className="btn-premium"
            style={{ backgroundColor: colors.success, color: 'white', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 0 }}>+</span> New Assessment
          </Link>
        </div>

        {assessments.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.1 }}>📋</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: colors.brand, margin: '0 0 10px 0' }}>No Assessments Yet</h4>
            <p style={{ color: colors.textMuted, margin: '0 0 28px 0', maxWidth: '340px', marginInline: 'auto' }}>
              This building hasn't been screened yet. Run the first RVS assessment below.
            </p>
            <Link
              to={`/assessments/new?building_id=${id}`}
              className="btn-premium"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: colors.success, color: 'white', padding: '12px 24px', borderRadius: '14px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 0 }}>+</span> Create First Assessment
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  {['Date', 'Inspector', 'Building Type', 'SL1 Score', 'Result', 'Actions'].map((head, i) => (
                    <th key={i} style={{ padding: '16px 20px', fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>
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
                      <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text }}>
                          {new Date(a.assessment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.875rem', color: colors.text, fontWeight: '500' }}>{a.inspector_name}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#f1f5f9', color: colors.textMuted, padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.04em', border: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>
                          {a.building_type}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: '900', lineHeight: 1, color: isPass ? colors.success : colors.danger }}>
                            {parseFloat(a.final_score).toFixed(1)}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>/ 5.0</span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em', backgroundColor: isPass ? colors.successGlow : colors.dangerGlow, color: isPass ? colors.success : colors.danger, border: `1px solid ${isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', flexShrink: 0 }}></span>
                          {a.result}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/assessments/${a.id}`} className="btn-ghost" style={{ textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700', color: colors.textMuted, padding: '7px 14px', borderRadius: '9px', border: `1px solid ${colors.border}`, backgroundColor: 'white', whiteSpace: 'nowrap' }}>
                            View
                          </Link>
                          <Link to={`/reports/${a.id}`} className="btn-premium" style={{ textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700', color: 'white', padding: '7px 14px', borderRadius: '9px', backgroundColor: colors.primary, border: 'none', whiteSpace: 'nowrap' }}>
                            Report
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
    </div>
  );
}

export default BuildingDetailPage;
