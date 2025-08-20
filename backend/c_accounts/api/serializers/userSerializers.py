from rest_framework import serializers
from c_accounts.models import UserProfile

class UserBasicSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    class Meta:
        model = UserProfile
        fields = ["username", "avatar"]
