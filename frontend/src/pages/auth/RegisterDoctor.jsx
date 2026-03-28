import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

const SPECIALIZATIONS = [
  'General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic',
  'Pediatrician','Gynecologist','Ophthalmologist','ENT Specialist','Psychiatrist',
];

export default function RegisterDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', phone: '',
    specialization: 'General Physician', experience_years: 0,
    consultation_fee: 0, bio: '', password: '', password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await API.post('/auth/register/doctor/', form);
      navigate('/login', { state: { message: 'Doctor registration successful! Please log in.' } });
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (k) => errors[k] ? <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors[k]}</span> : null;

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <span className="logo-icon">👨‍⚕️</span>
          <h1>Doctor Registration</h1>
          <p>Create your doctor account</p>
        </div>

        {errors.non_field_errors && <div className="alert alert-error">{errors.non_field_errors}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input value={form.first_name} onChange={set('first_name')} required placeholder="First name" />
              {fieldError('first_name')}
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input value={form.last_name} onChange={set('last_name')} required placeholder="Last name" />
              {fieldError('last_name')}
            </div>
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input value={form.username} onChange={set('username')} required placeholder="Username" />
            {fieldError('username')}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required placeholder="email@example.com" />
              {fieldError('email')}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="Phone number" />
            </div>
          </div>
          <div className="form-group">
            <label>Specialization *</label>
            <select value={form.specialization} onChange={set('specialization')}>
              {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Experience (years)</label>
              <input type="number" min="0" value={form.experience_years} onChange={set('experience_years')} />
            </div>
            <div className="form-group">
              <label>Consultation Fee ($)</label>
              <input type="number" min="0" step="0.01" value={form.consultation_fee} onChange={set('consultation_fee')} />
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={form.bio} onChange={set('bio')} placeholder="Brief professional bio" rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={form.password} onChange={set('password')} required placeholder="Password" />
              {fieldError('password')}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" value={form.password2} onChange={set('password2')} required placeholder="Confirm" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Registering...' : '✅ Create Doctor Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
