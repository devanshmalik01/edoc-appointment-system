from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.utils import timezone

from .models import User, DoctorProfile, Appointment
from .forms import (
    PatientRegistrationForm, DoctorRegistrationForm, LoginForm,
    AppointmentForm, AppointmentStatusForm, DoctorProfileForm, UserEditForm
)


def home(request):
    if request.user.is_authenticated:
        if request.user.is_admin_user() or request.user.is_superuser:
            return redirect('admin_dashboard')
        elif request.user.is_doctor():
            return redirect('doctor_dashboard')
        else:
            return redirect('patient_dashboard')
    return redirect('login')


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = LoginForm(request, data=request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.get_full_name() or user.username}!')
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password.')
    return render(request, 'auth/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')


def register_patient(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = PatientRegistrationForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Patient account created successfully!')
            return redirect('patient_dashboard')
    return render(request, 'auth/register_patient.html', {'form': form})


def register_doctor(request):
    if request.user.is_authenticated:
        return redirect('home')
    form = DoctorRegistrationForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Doctor account created successfully!')
            return redirect('doctor_dashboard')
    return render(request, 'auth/register_doctor.html', {'form': form})


# --- Patient Views ---

@login_required
def patient_dashboard(request):
    if not request.user.is_patient():
        messages.error(request, 'Access denied.')
        return redirect('home')
    appointments = Appointment.objects.filter(patient=request.user).select_related('doctor')
    upcoming = appointments.filter(
        status__in=[Appointment.STATUS_PENDING, Appointment.STATUS_CONFIRMED],
        appointment_date__gte=timezone.now().date()
    )
    past = appointments.exclude(
        status__in=[Appointment.STATUS_PENDING, Appointment.STATUS_CONFIRMED],
        appointment_date__gte=timezone.now().date()
    )
    context = {
        'appointments': appointments,
        'upcoming': upcoming,
        'past': past,
    }
    return render(request, 'patient/dashboard.html', context)


@login_required
def doctor_list(request):
    if not request.user.is_patient():
        messages.error(request, 'Access denied.')
        return redirect('home')
    specialization = request.GET.get('specialization', '')
    search = request.GET.get('search', '')
    profiles = DoctorProfile.objects.filter(
        user__is_active=True, is_available=True
    ).select_related('user')
    if specialization:
        profiles = profiles.filter(specialization=specialization)
    if search:
        profiles = profiles.filter(
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(specialization__icontains=search)
        )
    specializations = DoctorProfile.SPECIALIZATION_CHOICES
    context = {
        'profiles': profiles,
        'specializations': specializations,
        'selected_spec': specialization,
        'search': search,
    }
    return render(request, 'patient/doctor_list.html', context)


@login_required
def book_appointment(request, doctor_id):
    if not request.user.is_patient():
        messages.error(request, 'Access denied.')
        return redirect('home')
    doctor = get_object_or_404(User, id=doctor_id, role=User.ROLE_DOCTOR)
    form = AppointmentForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            appointment = form.save(commit=False)
            appointment.patient = request.user
            appointment.doctor = doctor
            appointment.save()
            messages.success(request, f'Appointment booked with Dr. {doctor.get_full_name()}!')
            return redirect('patient_dashboard')
    context = {
        'doctor': doctor,
        'form': form,
    }
    return render(request, 'patient/book_appointment.html', context)


@login_required
def cancel_appointment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)
    if request.method == 'POST':
        appointment.status = Appointment.STATUS_CANCELLED
        appointment.save()
        messages.success(request, 'Appointment cancelled.')
    return redirect('patient_dashboard')


# --- Doctor Views ---

@login_required
def doctor_dashboard(request):
    if not request.user.is_doctor():
        messages.error(request, 'Access denied.')
        return redirect('home')
    appointments = Appointment.objects.filter(doctor=request.user).select_related('patient')
    pending = appointments.filter(status=Appointment.STATUS_PENDING)
    confirmed = appointments.filter(status=Appointment.STATUS_CONFIRMED)
    today = appointments.filter(
        appointment_date=timezone.now().date(),
        status__in=[Appointment.STATUS_PENDING, Appointment.STATUS_CONFIRMED]
    )
    context = {
        'appointments': appointments,
        'pending': pending,
        'confirmed': confirmed,
        'today': today,
    }
    return render(request, 'doctor/dashboard.html', context)


@login_required
def update_appointment_status(request, appointment_id):
    if not request.user.is_doctor():
        messages.error(request, 'Access denied.')
        return redirect('home')
    appointment = get_object_or_404(Appointment, id=appointment_id, doctor=request.user)
    form = AppointmentStatusForm(request.POST or None, instance=appointment)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, 'Appointment updated.')
            return redirect('doctor_dashboard')
    return render(request, 'doctor/update_appointment.html', {'form': form, 'appointment': appointment})


@login_required
def doctor_profile(request):
    if not request.user.is_doctor():
        messages.error(request, 'Access denied.')
        return redirect('home')
    profile, _ = DoctorProfile.objects.get_or_create(user=request.user)
    form = DoctorProfileForm(request.POST or None, instance=profile)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully.')
            return redirect('doctor_dashboard')
    return render(request, 'doctor/profile.html', {'form': form, 'profile': profile})


# --- Admin Views ---

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        if not (request.user.is_admin_user() or request.user.is_superuser):
            messages.error(request, 'Admin access required.')
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return wrapper


@admin_required
def admin_dashboard(request):
    patients = User.objects.filter(role=User.ROLE_PATIENT)
    doctors = User.objects.filter(role=User.ROLE_DOCTOR)
    appointments = Appointment.objects.all().select_related('patient', 'doctor')
    context = {
        'patients': patients,
        'doctors': doctors,
        'appointments': appointments,
        'total_patients': patients.count(),
        'total_doctors': doctors.count(),
        'total_appointments': appointments.count(),
        'pending_appointments': appointments.filter(status=Appointment.STATUS_PENDING).count(),
    }
    return render(request, 'admin_panel/dashboard.html', context)


@admin_required
def admin_users(request):
    role = request.GET.get('role', '')
    users = User.objects.all()
    if role:
        users = users.filter(role=role)
    search = request.GET.get('search', '')
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )
    return render(request, 'admin_panel/users.html', {
        'users': users,
        'selected_role': role,
        'search': search,
    })


@admin_required
def admin_edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    form = UserEditForm(request.POST or None, instance=user)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, f'User {user.username} updated.')
            return redirect('admin_users')
    return render(request, 'admin_panel/edit_user.html', {'form': form, 'edited_user': user})


@admin_required
def admin_toggle_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        user.is_active = not user.is_active
        user.save()
        status = 'activated' if user.is_active else 'deactivated'
        messages.success(request, f'User {user.username} has been {status}.')
    return redirect('admin_users')


@admin_required
def admin_appointments(request):
    appointments = Appointment.objects.all().select_related('patient', 'doctor')
    status_filter = request.GET.get('status', '')
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    return render(request, 'admin_panel/appointments.html', {
        'appointments': appointments,
        'status_choices': Appointment.STATUS_CHOICES,
        'selected_status': status_filter,
    })


@admin_required
def admin_delete_appointment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    if request.method == 'POST':
        appointment.delete()
        messages.success(request, 'Appointment deleted.')
    return redirect('admin_appointments')
