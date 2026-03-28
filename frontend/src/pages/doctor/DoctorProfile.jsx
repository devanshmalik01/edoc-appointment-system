import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const SPECIALIZATIONS = [
  'General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic',
  'Pediatrician','Gynecologist','Ophthalmologist','ENT Specialist','Psychiatrist',
];

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/doctor/profile/')
      .then((r) => setProfile(r.data))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/doctor/profile/', profile);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page"><Navbar /><div className="loading"><div className="spinner" /></div></div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <div>
            <h1>⚙️ Edit Profile</h1>
            <p>Update your professional information</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/doctor/dashboard')}>← Back</button>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Specialization</label>
                <select value={profile?.specialization || ''} onChange={set('specialization')}>
                  {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input type="number" min="0" value={profile?.experience_years || 0} onChange={set('experience_years')} />
                </div>
                <div className="form-group">
                  <label>Consultation Fee ($)</label>
                  <input type="number" min="0" step="0.01" value={profile?.consultation_fee || 0} onChange={set('consultation_fee')} />
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea rows={4} value={profile?.bio || ''} onChange={set('bio')} placeholder="Professional bio..." />
              </div>
              <div className="form-group">
                <label>Available Days (comma-separated)</label>
                <input value={profile?.available_days || ''} onChange={set('available_days')} placeholder="Monday,Tuesday,Wednesday,Thursday,Friday" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={profile?.start_time || '09:00'} onChange={set('start_time')} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={profile?.end_time || '17:00'} onChange={set('end_time')} />
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="avail"
                  style={{ width: 'auto' }}
                  checked={profile?.is_available ?? true}
                  onChange={set('is_available')}
                />
                <label htmlFor="avail" style={{ marginBottom: 0 }}>Available for appointments</label>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
