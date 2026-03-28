import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const SPEC_ICONS = {
  'General Physician': '🩺', 'Cardiologist': '❤️', 'Dermatologist': '🧴',
  'Neurologist': '🧠', 'Orthopedic': '🦴', 'Pediatrician': '👶',
  'Gynecologist': '🌸', 'Ophthalmologist': '👁️', 'ENT Specialist': '👂', 'Psychiatrist': '🧘',
};

export default function DoctorList() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('');

  useEffect(() => {
    API.get('/specializations/').then((r) => setSpecializations(r.data));
    fetchDoctors();
  }, []);

  const fetchDoctors = async (s = '', sp = '') => {
    setLoading(true);
    const params = {};
    if (s) params.search = s;
    if (sp) params.specialization = sp;
    const r = await API.get('/doctors/', { params });
    setDoctors(r.data);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search, spec);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content container">
        <div className="page-header">
          <div>
            <h1>🔍 Find a Doctor</h1>
            <p>Browse our available specialists and book an appointment</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="filter-bar">
          <input
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={spec} onChange={(e) => setSpec(e.target.value)}>
            <option value="">All Specializations</option>
            {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">🔍 Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSpec(''); fetchDoctors(); }}>
            Clear
          </button>
        </form>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {doctors.map((doc) => {
              const profile = doc.doctor_profile || {};
              return (
                <div key={doc.id} className="doctor-card">
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">
                      {SPEC_ICONS[profile.specialization] || '👨‍⚕️'}
                    </div>
                    <h3>Dr. {doc.full_name}</h3>
                    <div className="spec">{profile.specialization}</div>
                  </div>
                  <div className="doctor-card-body">
                    <div className="doctor-meta">
                      <span>⭐ {profile.experience_years || 0} yrs exp</span>
                      <span>💰 ${profile.consultation_fee || 0}</span>
                    </div>
                    {profile.bio && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        {profile.bio.slice(0, 100)}{profile.bio.length > 100 ? '...' : ''}
                      </p>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/patient/book/${doc.id}`)}
                    >
                      📅 Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
