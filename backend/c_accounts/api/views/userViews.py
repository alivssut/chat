from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from c_accounts.models import UserProfile
from c_accounts.api.serializers.userSerializers import UserBasicSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


class UserBasicView(RetrieveAPIView):
    serializer_class = UserBasicSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        return UserProfile.objects.select_related("user").get(user=self.request.user)
