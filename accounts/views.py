from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def get_permissions(self):
        if self.action in ['me', 'logout']:
            return [IsAuthenticated()]
        return [AllowAny()]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'detail': 'Successfully logged out.'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def csrf(self, request):
        return Response({'csrfToken': get_token(request)})