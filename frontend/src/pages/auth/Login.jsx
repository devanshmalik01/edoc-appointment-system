import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      if (user.role === 'admin' || user.is_superuser) navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin')   setForm({ username: 'admin',    password: 'Admin@123' });
    if (role === 'doctor')  setForm({ username: 'dr_smith', password: 'Doctor@123' });
    if (role === 'patient') setForm({ username: 'alice',    password: 'Patient@123' });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🏥</span>
          <h1>eDoc</h1>
          <p>E-Doctor Appointment System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Don&apos;t have an account?
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Link to="/register/patient" className="btn btn-outline btn-sm">Register as Patient</Link>
            <Link to="/register/doctor" className="btn btn-outline btn-sm">Register as Doctor</Link>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            🔑 Demo accounts
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['admin', 'doctor', 'patient'].map((r) => (
              <button key={r} type="button" className="btn btn-secondary btn-sm"
                onClick={() => fillDemo(r)}>
                {r === 'admin' ? '👑' : r === 'doctor' ? '👨‍⚕️' : '🧑'} {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
