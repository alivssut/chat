from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from c_accounts.models import UserProfile, User
from c_accounts.api.serializers.userSerializers import UserBasicSerializer, UserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


class UserBasicView(RetrieveAPIView):
    serializer_class = UserBasicSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        return UserProfile.objects.select_related("user").get(user=self.request.user)

class UserContactsView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return User.objects.all().select_related("userprofile")