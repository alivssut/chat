from rest_framework import serializers
from c_chats.models import Room, Message, RoomMember
from c_accounts.models import User, UserProfile

class RoomDetailSerializer(serializers.ModelSerializer):
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'
        extra_fields = ['user_role']

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            print("role")
            try:
                member = obj.room_members.get(user=request.user, is_deleted=False)
                return member.role
            except RoomMember.DoesNotExist:
                return None
        return None

class RoomListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        if last_msg:
            return {
                "id": last_msg.id,
                "text": last_msg.content,
                "created_at": last_msg.created_at,
                "sender": last_msg.user.username
            }
        return None

        
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["avatar"]

class ChatRoomMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    profile = UserProfileSerializer(source="user.userprofile", read_only=True)

    class Meta:
        model = RoomMember
        fields = ["id", "username", "profile", "role"]