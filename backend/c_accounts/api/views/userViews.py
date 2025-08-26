from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from c_accounts.models import UserProfile, User, Contact
from c_accounts.api.serializers.userSerializers import UserBasicSerializer, UserSerializer, ContactSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework import status

class UserBasicView(RetrieveAPIView):
    serializer_class = UserBasicSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        return UserProfile.objects.select_related("user").get(user=self.request.user)

class UserContactsView(ListAPIView):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Contact.objects.filter(owner=self.request.user).select_related(
            'contact_user', 'contact_user__userprofile'
        )
            
