import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const STATUS_ICON = { pending: '⏳', confirmed: '✅', cancelled: '❌', completed: '🏁' };

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [updating, setUpdating] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    API.get('/doctor/appointments/')
      .then((r) => setAppointments(r.data))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const todayList = appointments.filter(
    (a) => a.appointment_date === today && ['pending', 'confirmed'].includes(a.status)
  );
  const pending = appointments.filter((a) => a.status === 'pending');
  const confirmed = appointments.filter((a) => a.status === 'confirmed');

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.patch(`/doctor/appointments/${id}/update/`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: newStatus } : a)
      );
      setMsg(`Appointment ${newStatus}.`);
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const displayed = tab === 'today' ? todayList
    : tab === 'pending' ? pending
    : tab === 'confirmed' ? confirmed
    : appointments;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container">
        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="page-header">
          <div>
            <h1>👨‍⚕️ Dr. {user?.first_name} {user?.last_name}</h1>
            <p>Manage your appointments</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/doctor/profile')}>
            ⚙️ Edit Profile
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{appointments.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-number">{todayList.length}</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-number">{pending.length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card green">
            <div className="stat-number">{confirmed.length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{appointments.filter((a) => a.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="section-tabs">
          {[
            ['today', `Today (${todayList.length})`],
            ['pending', `Pending (${pending.length})`],
            ['confirmed', `Confirmed (${confirmed.length})`],
            ['all', `All (${appointments.length})`],
          ].map(([key, label]) => (
            <button key={key} className={`section-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments in this category</h3>
          </div>
        ) : (
          <div className="appointment-list">
            {displayed.map((a) => (
              <div key={a.id} className={`appointment-card ${a.status}`}>
                <div className="appt-info">
                  <h4>🧑 {a.patient_name}</h4>
                  <div className="appt-meta">
                    <span>📅 {a.appointment_date}</span>
                    <span>🕐 {a.appointment_time}</span>
                  </div>
                  {a.reason && (
                    <p style={{ marginTop: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      💬 {a.reason}
                    </p>
                  )}
                </div>
                <div className="appt-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span className={`badge badge-${a.status}`}>{STATUS_ICON[a.status]} {a.status}</span>
                  {a.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-success btn-sm" disabled={updating === a.id}
                        onClick={() => updateStatus(a.id, 'confirmed')}>✅ Confirm</button>
                      <button className="btn btn-danger btn-sm" disabled={updating === a.id}
                        onClick={() => updateStatus(a.id, 'cancelled')}>❌ Cancel</button>
                    </div>
                  )}
                  {a.status === 'confirmed' && (
                    <button className="btn btn-primary btn-sm" disabled={updating === a.id}
                      onClick={() => updateStatus(a.id, 'completed')}>🏁 Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
