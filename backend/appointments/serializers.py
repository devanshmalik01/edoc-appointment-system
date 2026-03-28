from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, DoctorProfile, Appointment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'address', 'is_active']
        read_only_fields = ['id']


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'specialization', 'experience_years', 'consultation_fee',
            'bio', 'available_days', 'start_time', 'end_time', 'is_available',
        ]


class DoctorListSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone', 'doctor_profile']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class RegisterPatientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'address', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data, role=User.ROLE_PATIENT)
        user.set_password(password)
        user.save()
        return user


class RegisterDoctorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    specialization = serializers.ChoiceField(choices=DoctorProfile.SPECIALIZATION_CHOICES, write_only=True)
    experience_years = serializers.IntegerField(write_only=True, default=0)
    consultation_fee = serializers.DecimalField(max_digits=8, decimal_places=2, write_only=True, default=0)
    bio = serializers.CharField(write_only=True, allow_blank=True, default='')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'phone',
            'specialization', 'experience_years', 'consultation_fee', 'bio',
            'password', 'password2',
        ]

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        specialization = validated_data.pop('specialization')
        experience_years = validated_data.pop('experience_years')
        consultation_fee = validated_data.pop('consultation_fee')
        bio = validated_data.pop('bio', '')
        user = User(**validated_data, role=User.ROLE_DOCTOR)
        user.set_password(password)
        user.save()
        DoctorProfile.objects.create(
            user=user,
            specialization=specialization,
            experience_years=experience_years,
            consultation_fee=consultation_fee,
            bio=bio,
        )
        return user


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'doctor_specialization', 'appointment_date', 'appointment_time',
            'reason', 'status', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'patient']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def get_doctor_name(self, obj):
        return obj.doctor.get_full_name() or obj.doctor.username

    def get_doctor_specialization(self, obj):
        profile = getattr(obj.doctor, 'doctor_profile', None)
        return profile.specialization if profile else ''


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor', 'appointment_date', 'appointment_time', 'reason']

    def create(self, validated_data):
        request = self.context['request']
        return Appointment.objects.create(patient=request.user, **validated_data)


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status', 'notes']
