import React, { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'inspector' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.users);
    } catch (err) {
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'inspector' });
    setShowForm(true);
    setError('');
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editUser) {
        await userAPI.update(editUser.id, form);
        setSuccess('User updated successfully.');
      } else {
        await userAPI.create(form);
        setSuccess('User created successfully.');
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await userAPI.delete(userId);
      setSuccess('User deleted.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
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
    warning: '#f59e0b',
    warningGlow: 'rgba(245, 158, 11, 0.1)',
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

  const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
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
        .form-input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
        .btn-premium { transition: all 0.2s ease; cursor: pointer; }
        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(37,99,235,0.2); }
        .btn-premium:active { transform: translateY(0); }
        .btn-ghost { transition: all 0.2s ease; cursor: pointer; }
        .btn-ghost:hover { background-color: #f8fafc !important; border-color: #2563eb !important; color: #2563eb !important; }
        .btn-danger-ghost { transition: all 0.2s ease; cursor: pointer; }
        .btn-danger-ghost:hover { background-color: rgba(239,68,68,0.06) !important; border-color: #ef4444 !important; color: #ef4444 !important; }
        .table-row { transition: background-color 0.15s ease; border-bottom: 1px solid #f1f5f9; }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background-color: #f8fafc; }
        .loader-ring { width: 48px; height: 48px; border: 4px solid rgba(37,99,235,0.1); border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4,0,0.2,1) infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.04em', color: colors.brand }}>
            User Management
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textMuted, margin: 0, fontWeight: '500' }}>
            Manage inspectors and administrators
          </p>
        </div>
        <button
          className="btn-premium"
          onClick={openCreate}
          style={{ backgroundColor: colors.brand, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span style={{ fontSize: '1.4rem', lineHeight: 0 }}>+</span> Add User
        </button>
      </header>

      {/* Alerts */}
      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.875rem', fontWeight: '600', backgroundColor: colors.dangerGlow, color: colors.danger, border: `1px solid rgba(239,68,68,0.2)` }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.875rem', fontWeight: '600', backgroundColor: colors.successGlow, color: colors.success, border: `1px solid rgba(16,185,129,0.2)` }}>
          {success}
        </div>
      )}

      {/* Inline Form Panel */}
      {showForm && (
        <div style={{ backgroundColor: colors.surface, borderRadius: '24px', border: `1px solid ${colors.primary}`, boxShadow: `0 0 0 3px ${colors.primaryGlow}`, overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '800', color: colors.brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {editUser ? 'Edit User' : 'Create New User'}
            </h4>
            <button
              className="btn-ghost"
              onClick={() => setShowForm(false)}
              style={{ backgroundColor: 'white', color: colors.textMuted, border: `1px solid ${colors.border}`, padding: '7px 16px', borderRadius: '10px', fontWeight: '600', fontSize: '0.8rem', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div className="form-grid-2">
              <Field label="Full Name *">
                <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="e.g. Juan dela Cruz" style={inputStyle} />
              </Field>
              <Field label="Email *">
                <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} required placeholder="e.g. juan@example.com" style={inputStyle} />
              </Field>
            </div>

            <div className="form-grid-2" style={{ marginBottom: '24px' }}>
              <Field label={editUser ? 'Password (leave blank to keep current)' : 'Password *'}>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={editUser ? 'Leave blank to keep current' : 'Min. 6 characters'}
                  style={inputStyle}
                  {...(!editUser && { required: true, minLength: 6 })}
                />
              </Field>
              <Field label="Role">
                <select name="role" className="form-input" value={form.role} onChange={handleChange} style={inputStyle}>
                  <option value="inspector">Inspector</option>
                  <option value="admin">Administrator</option>
                </select>
              </Field>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
              <button
                type="submit"
                className="btn-premium"
                style={{ backgroundColor: colors.primary, color: 'white', border: 'none', padding: '11px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', fontFamily: 'inherit' }}
              >
                {editUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowForm(false)}
                style={{ backgroundColor: 'white', color: colors.textMuted, border: `1px solid ${colors.border}`, padding: '11px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table Card */}
      <div style={{ backgroundColor: colors.surface, borderRadius: '32px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px 36px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: colors.brand }}>All Users</h3>
            <p style={{ fontSize: '0.85rem', color: colors.textMuted, margin: '4px 0 0 0' }}>
              {users.length} account{users.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 40px' }}>
            <div className="loader-ring"></div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '16px' }}>👤</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: colors.brand, margin: '0 0 8px 0' }}>No Users Yet</h4>
            <p style={{ color: colors.textMuted, margin: '0 0 24px 0' }}>Add the first inspector or administrator to get started.</p>
            <button
              className="btn-premium"
              onClick={openCreate}
              style={{ backgroundColor: colors.primary, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              + Add First User
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Registered', 'Actions'].map((head, i) => (
                    <th key={i} style={{ padding: '16px 20px', fontSize: '0.72rem', fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    {/* Name */}
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          backgroundColor: colors.primaryGlow,
                          color: colors.primary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.875rem', fontWeight: '800',
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '800', color: colors.brand, fontSize: '0.9rem' }}>{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{ fontSize: '0.875rem', color: colors.textMuted, fontWeight: '500' }}>{u.email}</span>
                    </td>

                    {/* Role badge */}
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 12px', borderRadius: '8px',
                        fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase',
                        backgroundColor: u.role === 'admin' ? colors.warningGlow : colors.primaryGlow,
                        color: u.role === 'admin' ? colors.warning : colors.primary,
                        border: `1px solid ${u.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(37,99,235,0.2)'}`,
                      }}>
                        {u.role === 'admin' ? '⭑ Admin' : 'Inspector'}
                      </span>
                    </td>

                    {/* Registered */}
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{ fontSize: '0.875rem', color: colors.textMuted, fontWeight: '500' }}>
                        {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-ghost"
                          onClick={() => openEdit(u)}
                          style={{ backgroundColor: 'white', color: colors.textMuted, border: `1px solid ${colors.border}`, padding: '7px 16px', borderRadius: '9px', fontWeight: '700', fontSize: '0.78rem', fontFamily: 'inherit' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger-ghost"
                          onClick={() => handleDelete(u.id, u.name)}
                          style={{ backgroundColor: 'white', color: colors.danger, border: `1px solid rgba(239,68,68,0.3)`, padding: '7px 16px', borderRadius: '9px', fontWeight: '700', fontSize: '0.78rem', fontFamily: 'inherit' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagementPage;