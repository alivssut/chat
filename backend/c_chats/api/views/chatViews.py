from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from c_chats.models import Room, Message, RoomMember
from c_chats.api.serializers.chatSerializers import RoomListSerializer, RoomDetailSerializer, MessageSerializer, ChatRoomMemberSerializer


class ChatRoomListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = Room.objects.filter(members=request.user, is_active=True).distinct()
        serializer = RoomListSerializer(rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ChatRoomMessageListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id, members=request.user)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found or access denied."}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(room=room, is_deleted=False).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ChatRoomDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = Room.objects.get(id=room_id, is_active=True)
        serializer = RoomDetailSerializer(room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ChatRoomMembersView(generics.ListAPIView):
    serializer_class = ChatRoomMemberSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs["room_id"]
        return RoomMember.objects.filter(room_id=room_id, is_deleted=False)\
            .select_related("user__userprofile")