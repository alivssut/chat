from rest_framework import serializers
from c_accounts.models import UserProfile, User

class UserBasicSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    class Meta:
        model = UserProfile
        fields = ["username", "avatar"]

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source="userprofile.avatar", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "avatar"]