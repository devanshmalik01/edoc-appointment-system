import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats/')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container">
        <div className="page-header">
          <div>
            <h1>👑 Admin Dashboard</h1>
            <p>Welcome back, {user?.first_name}! Here&apos;s your system overview.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats?.total_patients}</div>
                <div className="stat-label">Total Patients</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-number">{stats?.total_doctors}</div>
                <div className="stat-label">Total Doctors</div>
              </div>
              <div className="stat-card green">
                <div className="stat-number">{stats?.total_appointments}</div>
                <div className="stat-label">Total Appointments</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-number">{stats?.pending_appointments}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats?.confirmed_appointments}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-number">{stats?.completed_appointments}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card red">
                <div className="stat-number">{stats?.cancelled_appointments}</div>
                <div className="stat-label">Cancelled</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div className="card">
                <div className="card-header">
                  <h3>👥 User Management</h3>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
                    Manage All Users
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/users?role=patient')}>
                    View Patients
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/users?role=doctor')}>
                    View Doctors
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3>📅 Appointment Management</h3>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={() => navigate('/admin/appointments')}>
                    View All Appointments
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/appointments?status=pending')}>
                    Pending Appointments
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/appointments?status=completed')}>
                    Completed Appointments
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
