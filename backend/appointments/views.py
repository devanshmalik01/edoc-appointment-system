from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from .models import User, DoctorProfile, Appointment
from .serializers import (
    UserSerializer, DoctorListSerializer, DoctorProfileSerializer,
    RegisterPatientSerializer, RegisterDoctorSerializer,
    AppointmentSerializer, AppointmentCreateSerializer, AppointmentUpdateSerializer,
)


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_patient(request):
    serializer = RegisterPatientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Patient registered successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_doctor(request):
    serializer = RegisterDoctorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Doctor registered successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ──────────────────────────────────────────────
# Patient
# ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_list(request):
    profiles = DoctorProfile.objects.filter(is_available=True, user__is_active=True).select_related('user')
    specialization = request.query_params.get('specialization')
    search = request.query_params.get('search')
    if specialization:
        profiles = profiles.filter(specialization=specialization)
    if search:
        profiles = profiles.filter(
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(specialization__icontains=search)
        )
    doctor_users = [p.user for p in profiles]
    return Response(DoctorListSerializer(doctor_users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_detail(request, doctor_id):
    try:
        user = User.objects.get(id=doctor_id, role=User.ROLE_DOCTOR, is_active=True)
    except User.DoesNotExist:
        return Response({'error': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(DoctorListSerializer(user).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def patient_appointments(request):
    if request.method == 'GET':
        appointments = Appointment.objects.filter(patient=request.user).select_related('doctor', 'doctor__doctor_profile')
        return Response(AppointmentSerializer(appointments, many=True).data)
    serializer = AppointmentCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Appointment booked successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    appointment.status = Appointment.STATUS_CANCELLED
    appointment.save()
    return Response({'message': 'Appointment cancelled.'})


# ──────────────────────────────────────────────
# Doctor
# ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    if not request.user.is_doctor():
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
    appointments = Appointment.objects.filter(doctor=request.user).select_related('patient')
    return Response(AppointmentSerializer(appointments, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_appointment(request, appointment_id):
    if not request.user.is_doctor():
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        appointment = Appointment.objects.get(id=appointment_id, doctor=request.user)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = AppointmentUpdateSerializer(appointment, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Appointment updated.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def doctor_profile(request):
    if not request.user.is_doctor():
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
    profile, _ = DoctorProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response(DoctorProfileSerializer(profile).data)
    serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Profile updated.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────
# Admin
# ──────────────────────────────────────────────

def _require_admin(request):
    return request.user.is_authenticated and request.user.is_admin_user()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    return Response({
        'total_patients': User.objects.filter(role=User.ROLE_PATIENT).count(),
        'total_doctors': User.objects.filter(role=User.ROLE_DOCTOR).count(),
        'total_appointments': Appointment.objects.count(),
        'pending_appointments': Appointment.objects.filter(status=Appointment.STATUS_PENDING).count(),
        'confirmed_appointments': Appointment.objects.filter(status=Appointment.STATUS_CONFIRMED).count(),
        'completed_appointments': Appointment.objects.filter(status=Appointment.STATUS_COMPLETED).count(),
        'cancelled_appointments': Appointment.objects.filter(status=Appointment.STATUS_CANCELLED).count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    role = request.query_params.get('role')
    search = request.query_params.get('search')
    users = User.objects.all()
    if role:
        users = users.filter(role=role)
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )
    return Response(UserSerializer(users, many=True).data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def admin_edit_user(request, user_id):
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User updated.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_toggle_user(request, user_id):
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    user.is_active = not user.is_active
    user.save()
    return Response({'message': f'User {"activated" if user.is_active else "deactivated"}.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_appointments(request):
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    status_filter = request.query_params.get('status')
    appointments = Appointment.objects.all().select_related('patient', 'doctor', 'doctor__doctor_profile')
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    return Response(AppointmentSerializer(appointments, many=True).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_appointment(request, appointment_id):
    if not _require_admin(request):
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found.'}, status=status.HTTP_404_NOT_FOUND)
    appointment.delete()
    return Response({'message': 'Appointment deleted.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def specializations(request):
    return Response([s[0] for s in DoctorProfile.SPECIALIZATION_CHOICES])
