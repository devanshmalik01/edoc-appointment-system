import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', address: '', password: '', password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await API.post('/auth/register/patient/', form);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (k) => errors[k] ? <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors[k]}</span> : null;

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <span className="logo-icon">🧑</span>
          <h1>Patient Registration</h1>
          <p>Create your patient account</p>
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
            <input value={form.username} onChange={set('username')} required placeholder="Choose a username" />
            {fieldError('username')}
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
            {fieldError('email')}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={set('phone')} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={form.address} onChange={set('address')} placeholder="Your address" rows={2} />
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
            {loading ? '⏳ Registering...' : '✅ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
