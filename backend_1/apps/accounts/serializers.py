from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, StudentProfile
from .tokens import create_tokens_for_user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer with additional user information
    """
    
    def validate(self, attrs):
        # Get the user first
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            # Create tokens using our custom token creation
            token_data = create_tokens_for_user(user)
            
            # Prepare user data
            user_data = UserSerializer(user).data
            
            # Add student profile if user is a student
            if user.is_student:
                try:
                    student_profile = StudentProfile.objects.get(user=user)
                    user_data['student_profile'] = StudentProfileSerializer(student_profile).data
                except StudentProfile.DoesNotExist:
                    pass
            
            return {
                'access': token_data['access'],
                'refresh': token_data['refresh'],
                'access_expires_in': token_data['access_expires_in'],
                'refresh_expires_in': token_data['refresh_expires_in'],
                'user': user_data
            }
        else:
            raise serializers.ValidationError('Must include email and password.')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'user_type', 'profile_picture', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined']


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for StudentProfile model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['user', 'student_id', 'parent_name', 'parent_email', 'parent_phone', 'address', 'date_of_birth']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=['student', 'admin'], required=False)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user_type = attrs.get('user_type')
        
        if email and password:
            user = authenticate(email=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            # Check user type if specified
            if user_type:
                if user_type == 'student' and not user.is_student:
                    raise serializers.ValidationError('Invalid credentials for student login.')
                elif user_type == 'admin' and not user.is_admin_user:
                    raise serializers.ValidationError('Invalid credentials for admin login.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError('New passwords do not match.')
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password."""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User with this email does not exist.')
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for reset password."""
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match.')
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = ['name', 'phone', 'profile_picture']
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating student profile."""
    user = UserProfileUpdateSerializer()
    
    class Meta:
        model = StudentProfile
        fields = ['user', 'parent_name', 'parent_email', 'parent_phone', 'address', 'date_of_birth']
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update user fields
        if user_data:
            user_serializer = UserProfileUpdateSerializer(instance.user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
        
        # Update student profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
