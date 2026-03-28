from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/patient/', views.register_patient, name='register_patient'),
    path('auth/register/doctor/', views.register_doctor, name='register_doctor'),
    path('auth/me/', views.me, name='me'),

    # Patient
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/<int:doctor_id>/', views.doctor_detail, name='doctor_detail'),
    path('patient/appointments/', views.patient_appointments, name='patient_appointments'),
    path('patient/appointments/<int:appointment_id>/cancel/', views.cancel_appointment, name='cancel_appointment'),

    # Doctor
    path('doctor/appointments/', views.doctor_appointments, name='doctor_appointments'),
    path('doctor/appointments/<int:appointment_id>/update/', views.update_appointment, name='update_appointment'),
    path('doctor/profile/', views.doctor_profile, name='doctor_profile'),

    # Admin
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/users/<int:user_id>/', views.admin_edit_user, name='admin_edit_user'),
    path('admin/users/<int:user_id>/toggle/', views.admin_toggle_user, name='admin_toggle_user'),
    path('admin/appointments/', views.admin_appointments, name='admin_appointments'),
    path('admin/appointments/<int:appointment_id>/', views.admin_delete_appointment, name='admin_delete_appointment'),

    # Misc
    path('specializations/', views.specializations, name='specializations'),
]
