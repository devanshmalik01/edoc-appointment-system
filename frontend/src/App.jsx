import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import RegisterPatient from './pages/auth/RegisterPatient';
import RegisterDoctor from './pages/auth/RegisterDoctor';

import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorList from './pages/patient/DoctorList';
import BookAppointment from './pages/patient/BookAppointment';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAppointments from './pages/admin/AdminAppointments';

function RootRedirect() {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/patient/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>
          } />
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['patient']}><DoctorList /></ProtectedRoute>
          } />
          <Route path="/patient/book/:doctorId" element={
            <ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>
          } />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
