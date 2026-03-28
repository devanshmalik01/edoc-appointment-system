import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const STATUS_ICON = { pending: '⏳', confirmed: '✅', cancelled: '❌', completed: '🏁' };

export default function AdminAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(new URLSearchParams(location.search).get('status') || '');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const res = await API.get('/admin/appointments/', { params });
    setAppointments(res.data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment? This cannot be undone.')) return;
    await API.delete(`/admin/appointments/${id}/`);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setMsg('Appointment deleted.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container">
        <div className="page-header">
          <div>
            <h1>📅 Appointment Management</h1>
            <p>View and manage all appointments in the system</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>← Dashboard</button>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="filter-bar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setStatusFilter('')}>Clear Filter</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h3>Total: {appointments.length} appointments</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th><th>Doctor</th><th>Specialization</th>
                    <th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.patient_name}</strong></td>
                      <td>Dr. {a.doctor_name}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.doctor_specialization}</td>
                      <td>{a.appointment_date}</td>
                      <td>{a.appointment_time}</td>
                      <td style={{ maxWidth: 160, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.reason || '-'}
                      </td>
                      <td><span className={`badge badge-${a.status}`}>{STATUS_ICON[a.status]} {a.status}</span></td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
