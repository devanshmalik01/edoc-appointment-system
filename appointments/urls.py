from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/patient/', views.register_patient, name='register_patient'),
    path('register/doctor/', views.register_doctor, name='register_doctor'),

    # Patient
    path('patient/dashboard/', views.patient_dashboard, name='patient_dashboard'),
    path('patient/doctors/', views.doctor_list, name='doctor_list'),
    path('patient/book/<int:doctor_id>/', views.book_appointment, name='book_appointment'),
    path('patient/cancel/<int:appointment_id>/', views.cancel_appointment, name='cancel_appointment'),

    # Doctor
    path('doctor/dashboard/', views.doctor_dashboard, name='doctor_dashboard'),
    path('doctor/appointment/<int:appointment_id>/update/', views.update_appointment_status, name='update_appointment_status'),
    path('doctor/profile/', views.doctor_profile, name='doctor_profile'),

    # Admin
    path('admin-panel/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-panel/users/', views.admin_users, name='admin_users'),
    path('admin-panel/users/<int:user_id>/edit/', views.admin_edit_user, name='admin_edit_user'),
    path('admin-panel/users/<int:user_id>/toggle/', views.admin_toggle_user, name='admin_toggle_user'),
    path('admin-panel/appointments/', views.admin_appointments, name='admin_appointments'),
    path('admin-panel/appointments/<int:appointment_id>/delete/', views.admin_delete_appointment, name='admin_delete_appointment'),
]
