from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import authenticate
from django.contrib.auth.signals import user_logged_in
from django.conf import settings
from apps.users.serializers import UserSerializer
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

class CustomTokenObtainPairView(TokenObtainPairView):
    @extend_schema(
        responses={
            200: inline_serializer(
                name='AuthTokenResponse',
                fields={
                    'access': serializers.CharField(),
                    'userData': UserSerializer()
                }
            )
        }
    )
    def post(self, request, *args, **kwargs):

        # Validate credentials first
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Nombre de usuario o contraseña no válidos.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=username, password=password)
        if not user:
            return Response(
                {'detail': 'Credenciales incorrectas'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            refresh_token = response.data["refresh"]
            access_token = response.data["access"]
            
            # Manually send the user_logged_in signal since JWT doesn't trigger it
            user_logged_in.send(sender=user.__class__, request=request, user=user)
            
            # Set httpOnly cookie with debug
            response.set_cookie(
                "refresh_token",
                refresh_token,
                max_age=864000,                    # 10 days
                httponly=True,                     # Security: No JS access
                secure=False,                      # Allow HTTP in development
                samesite="Lax",                   # Less restrictive
                domain=None,                      # Auto-determine domain
                path="/",                         # Available site-wide
            )

            response.data = {
                "access": access_token,
                "userData": UserSerializer(user).data
            }
        
        return response


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    @extend_schema(
        responses={
            200: inline_serializer(
                name='AuthRefreshResponse',
                fields={
                    'access': serializers.CharField(),
                    'userData': UserSerializer()
                }
            )
        }
    )
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            raise InvalidToken('No refresh token found in cookie.')
        
        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken as e:
            raise InvalidToken(e.detail)

        # Get the new access token
        access_token = serializer.validated_data['access']
        
        # Decode the token to get user_id
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(access_token)
        user_id = token['user_id']
        
        # Fetch user data
        from apps.users.models import User
        try:
            user = User.objects.get(id=user_id)
            user_data = UserSerializer(user).data
        except User.DoesNotExist:
            raise InvalidToken('User not found')
        
        response = Response({
            'access': access_token,
            'userData': user_data
        }, status=status.HTTP_200_OK)
        
        return response


class CustomLogoutView(APIView):
    """
    Logout view that clears the refresh token cookie
    """
    permission_classes = []  # Allow both authenticated and unauthenticated users
    
    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name='LogoutCustomResponse',
                fields={'detail': serializers.CharField()}
            )
        }
    )
    def post(self, request, *args, **kwargs):
        response = Response(
            {'detail': 'Successfully logged out'}, 
            status=status.HTTP_200_OK
        )
        
        # Clear the refresh token cookie
        response.delete_cookie(
            "refresh_token",
            path="/",
            domain=None,
            samesite="Lax"
        )
        
        return response

