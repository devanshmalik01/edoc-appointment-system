import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const STATUS_ICON = { pending: '⏳', confirmed: '✅', cancelled: '❌', completed: '🏁' };

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    API.get('/patient/appointments/')
      .then((r) => setAppointments(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    await API.patch(`/patient/appointments/${id}/cancel/`);
    setAppointments((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a)
    );
    setMsg('Appointment cancelled.');
    setTimeout(() => setMsg(''), 3000);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(
    (a) => ['pending', 'confirmed'].includes(a.status) && a.appointment_date >= today
  );
  const past = appointments.filter(
    (a) => !(['pending', 'confirmed'].includes(a.status) && a.appointment_date >= today)
  );
  const displayed = tab === 'upcoming' ? upcoming : tab === 'past' ? past : appointments;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container">
        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="page-header">
          <div>
            <h1>👋 Welcome, {user?.first_name}!</h1>
            <p>Manage your appointments and find doctors</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>
            🔍 Find a Doctor
          </button>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-number">{appointments.length}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-number">{appointments.filter((a) => a.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card green">
            <div className="stat-number">{appointments.filter((a) => a.status === 'confirmed').length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-number">{appointments.filter((a) => a.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="section-tabs">
          {[['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past (${past.length})`], ['all', `All (${appointments.length})`]].map(
            ([key, label]) => (
              <button key={key} className={`section-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                {label}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <p>Book your first appointment with a doctor</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/patient/doctors')}>
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="appointment-list">
            {displayed.map((a) => (
              <div key={a.id} className={`appointment-card ${a.status}`}>
                <div className="appt-info">
                  <h4>👨‍⚕️ Dr. {a.doctor_name}</h4>
                  <p>{a.doctor_specialization}</p>
                  <div className="appt-meta">
                    <span>📅 {a.appointment_date}</span>
                    <span>🕐 {a.appointment_time}</span>
                    {a.reason && <span>💬 {a.reason}</span>}
                  </div>
                  {a.notes && (
                    <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      📝 Doctor notes: {a.notes}
                    </p>
                  )}
                </div>
                <div className="appt-actions">
                  <span className={`badge badge-${a.status}`}>
                    {STATUS_ICON[a.status]} {a.status}
                  </span>
                  {['pending', 'confirmed'].includes(a.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>
                      Cancel
                    </button>
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
