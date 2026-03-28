import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(new URLSearchParams(location.search).get('role') || '');
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const fetchUsers = async (s = search, r = roleFilter) => {
    setLoading(true);
    const params = {};
    if (s) params.search = s;
    if (r) params.role = r;
    const res = await API.get('/admin/users/', { params });
    setUsers(res.data);
    setLoading(false);
  };

  const handleToggle = async (id) => {
    await API.patch(`/admin/users/${id}/toggle/`);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !u.is_active } : u));
    setMsg('User status updated.');
    setTimeout(() => setMsg(''), 3000);
  };

  const openEdit = (user) => {
    setEditing(user.id);
    setEditForm({
      first_name: user.first_name, last_name: user.last_name,
      email: user.email, phone: user.phone, role: user.role,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await API.put(`/admin/users/${editing}/`, editForm);
    setUsers((prev) => prev.map((u) => u.id === editing ? { ...u, ...editForm } : u));
    setEditing(null);
    setMsg('User updated.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container">
        <div className="page-header">
          <div>
            <h1>👥 User Management</h1>
            <p>Manage all patients, doctors, and admins</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>← Dashboard</button>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="filter-bar">
          <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
          <button className="btn btn-primary" onClick={() => fetchUsers()}>🔍 Search</button>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setRoleFilter(''); fetchUsers('', ''); }}>Clear</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Username</th><th>Email</th>
                    <th>Role</th><th>Phone</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.first_name} {u.last_name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>@{u.username}</td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td><span className={`badge-role ${u.role}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{u.phone || '-'}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                          background: u.is_active ? '#d1fae5' : '#fee2e2',
                          color: u.is_active ? '#065f46' : '#991b1b',
                        }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>✏️ Edit</button>
                          <button
                            className={`btn btn-sm ${u.is_active ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggle(u.id)}
                          >
                            {u.is_active ? '🚫 Deactivate' : '✅ Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-overlay" onClick={() => setEditing(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Edit User</h3>
                <button className="modal-close" onClick={() => setEditing(null)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEdit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
