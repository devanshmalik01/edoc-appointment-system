import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ appointment_date: '', appointment_time: '', reason: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/doctors/${doctorId}/`)
      .then((r) => setDoctor(r.data))
      .catch(() => navigate('/patient/doctors'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await API.post('/patient/appointments/', { ...form, doctor: doctorId });
      navigate('/patient/dashboard', { state: { message: 'Appointment booked successfully!' } });
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const profile = doctor?.doctor_profile || {};
  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className="page"><Navbar /><div className="loading"><div className="spinner" /></div></div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <div>
            <h1>📅 Book Appointment</h1>
            <p>Schedule your visit with the doctor</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/patient/doctors')}>← Back</button>
        </div>

        {doctor && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'white',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
              }}>👨‍⚕️</div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Dr. {doctor.full_name}</h3>
                <p style={{ opacity: 0.9 }}>{profile.specialization}</p>
                <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>
                  {profile.experience_years} yrs experience · ${profile.consultation_fee} fee
                </p>
              </div>
            </div>
            {profile.bio && (
              <div style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {profile.bio}
              </div>
            )}
          </div>
        )}

        <div className="card">
          <div className="card-header"><h3>📋 Appointment Details</h3></div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={form.appointment_date}
                    min={todayStr}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={form.appointment_time}
                    onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason for visit</label>
                <textarea
                  rows={4}
                  placeholder="Describe your symptoms or reason for the appointment..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? '⏳ Booking...' : '✅ Confirm Booking'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/patient/doctors')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
