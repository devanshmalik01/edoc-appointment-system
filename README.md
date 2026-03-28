# eDoc — E-Doctor Appointment System

A full-stack web application for online doctor appointment scheduling.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router v7, Axios, CSS |
| Backend | Django 6 + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | SQLite (SQL) |
| CORS | django-cors-headers |

## ✨ Features

### 👑 Admin
- View system-wide statistics (patients, doctors, appointments)
- Manage all users — edit details, activate/deactivate accounts
- View and delete all appointments with status filtering

### 👨‍⚕️ Doctor
- View personal appointments (Today / Pending / Confirmed / All)
- Confirm, cancel, or mark appointments as completed
- Edit professional profile (specialization, fee, availability, bio)

### 🧑 Patient
- Register and log in
- Browse available doctors filtered by specialization or name
- Book appointments with selected doctors
- View upcoming and past appointments
- Cancel pending/confirmed appointments

## 📁 Project Structure

```
edoc-appointment-system/
├── backend/                     # Django REST API
│   ├── appointments/
│   │   ├── models.py            # User, DoctorProfile, Appointment
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # API views
│   │   └── urls.py              # App URL patterns
│   ├── edoc/
│   │   ├── settings.py          # Django settings + JWT + CORS
│   │   └── urls.py              # Root URL conf
│   ├── requirements.txt
│   └── manage.py
└── frontend/                    # React SPA
    ├── src/
    │   ├── api/axios.js         # Axios instance + JWT interceptors
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── auth/            # Login, RegisterPatient, RegisterDoctor
    │   │   ├── patient/         # Dashboard, DoctorList, BookAppointment
    │   │   ├── doctor/          # Dashboard, Profile
    │   │   └── admin/           # Dashboard, Users, Appointments
    │   ├── index.css            # Global styles
    │   └── App.jsx              # Route definitions
    ├── vite.config.js
    └── package.json
```

## 🚀 Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Seed demo data (optional)

```python
# backend/manage.py shell
from appointments.models import User, DoctorProfile
# See /tmp/seed.py for full example
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # development server at http://localhost:5173
npm run build        # production build → dist/
```

## 🔐 Demo Accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Doctor | `dr_smith` | `Doctor@123` |
| Patient | `alice` | `Patient@123` |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/token/` | JWT login |
| POST | `/api/token/refresh/` | Refresh token |
| POST | `/api/auth/register/patient/` | Register patient |
| POST | `/api/auth/register/doctor/` | Register doctor |
| GET | `/api/auth/me/` | Current user |
| GET | `/api/doctors/` | List doctors |
| GET/POST | `/api/patient/appointments/` | Patient appointments |
| PATCH | `/api/patient/appointments/{id}/cancel/` | Cancel appointment |
| GET | `/api/doctor/appointments/` | Doctor appointments |
| PATCH | `/api/doctor/appointments/{id}/update/` | Update appointment status |
| GET/PUT | `/api/doctor/profile/` | Doctor profile |
| GET | `/api/admin/stats/` | System statistics |
| GET | `/api/admin/users/` | All users |
| PUT | `/api/admin/users/{id}/` | Edit user |
| PATCH | `/api/admin/users/{id}/toggle/` | Toggle user active |
| GET | `/api/admin/appointments/` | All appointments |
| DELETE | `/api/admin/appointments/{id}/` | Delete appointment |
