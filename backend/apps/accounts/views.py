from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User, StudentProfile
from .serializers import (
    LoginSerializer, UserSerializer, StudentProfileSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    UserProfileUpdateSerializer, StudentProfileUpdateSerializer
)

User = get_user_model()


class LoginView(APIView):
    """Custom login view with user type validation."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Prepare user data
            user_data = UserSerializer(user).data
            
            # Add student profile if user is a student
            if user.is_student:
                try:
                    student_profile = StudentProfile.objects.get(user=user)
                    user_data['student_profile'] = StudentProfileSerializer(student_profile).data
                except StudentProfile.DoesNotExist:
                    pass
            
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
                'user': user_data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout view to blacklist refresh token."""
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """View for getting and updating user profile."""
    
    def get(self, request):
        """Get current user profile."""
        user_data = UserSerializer(request.user).data
        
        if request.user.is_student:
            try:
                student_profile = StudentProfile.objects.get(user=request.user)
                return Response({
                    'user': user_data,
                    'student_profile': StudentProfileSerializer(student_profile).data
                })
            except StudentProfile.DoesNotExist:
                pass
        
        return Response({'user': user_data})
    
    def put(self, request):
        """Update user profile."""
        if request.user.is_student:
            try:
                student_profile = StudentProfile.objects.get(user=request.user)
                serializer = StudentProfileUpdateSerializer(student_profile, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        'user': UserSerializer(request.user).data,
                        'student_profile': StudentProfileSerializer(student_profile).data
                    })
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except StudentProfile.DoesNotExist:
                return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'user': UserSerializer(request.user).data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """View for changing password."""
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """View for forgot password."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                
                # Generate password reset token
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Create reset link (you'll need to implement the frontend route)
                reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
                
                # Send email (configure email settings in production)
                subject = 'Password Reset - R.B Computer'
                message = f'Click the link to reset your password: {reset_link}'
                
                # In development, just return the link
                if settings.DEBUG:
                    return Response({
                        'message': 'Password reset link generated',
                        'reset_link': reset_link  # Remove this in production
                    }, status=status.HTTP_200_OK)
                
                # In production, send actual email
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
                return Response({'message': 'Password reset link sent to your email'}, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Don't reveal if email exists or not for security
                return Response({'message': 'If the email exists, a reset link has been sent'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """View for resetting password with token."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                serializer = ResetPasswordSerializer(data=request.data)
                if serializer.is_valid():
                    user.set_password(serializer.validated_data['new_password'])
                    user.save()
                    return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def user_info(request):
    """Get current user information."""
    user_data = UserSerializer(request.user).data
    
    if request.user.is_student:
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
            user_data['student_profile'] = StudentProfileSerializer(student_profile).data
        except StudentProfile.DoesNotExist:
            pass
    
    return Response(user_data)
