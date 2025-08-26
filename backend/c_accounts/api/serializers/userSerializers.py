from rest_framework import serializers
from c_accounts.models import UserProfile, User, Contact

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
        
class BasicUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar']
        
    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'profile']

    def get_profile(self, obj):
        profile = getattr(obj, 'userprofile', None)
        return {'avatar': profile.avatar.url if profile and profile.avatar else None}
    
    def get_display_name(self, obj):
        contact_instance = self.context.get('contact_instance', None)
        if contact_instance:
            return contact_instance.display_name or obj.username
        return obj.username
        

class ContactSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='contact_user.id', read_only=True)
    username = serializers.CharField(source='contact_user.username', read_only=True)
    avatar = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Contact
        fields = ['id', 'username', 'display_name', 'avatar']

    def get_avatar(self, obj):
        profile = getattr(obj.contact_user, 'userprofile', None)
        if profile and profile.avatar:
            return profile.avatar.url
        return None