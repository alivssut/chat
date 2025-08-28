from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework import viewsets
from c_chats.models import Room, Message, RoomMember
from c_chats.api.serializers.chatSerializers import RoomListSerializer, RoomDetailSerializer, MessageSerializer, ChatRoomMemberSerializer, RoomCreateSerializer, RoomAvatarSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from uuid import UUID
from django.utils import timezone

def convert_uuid_to_str(obj):
    if isinstance(obj, dict):
        return {k: convert_uuid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_uuid_to_str(i) for i in obj]
    elif isinstance(obj, UUID):
        return str(obj)
    else:
        return obj

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
            

class CreateGroupView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = RoomCreateSerializer(data=request.data, context={"request": request, "room_type": Room.RoomType.GROUP})
        if serializer.is_valid():
            room = serializer.save()
            room_data = RoomListSerializer(room, context={"request": request}).data
            room_data = convert_uuid_to_str(room_data)

            channel_layer = get_channel_layer()
            user_ids = list(room.members.values_list('id', flat=True))

            for user_id in user_ids:
                async_to_sync(channel_layer.group_send)(
                    f"user_chatlist_{str(user_id)}",
                    {
                        "type": "chat_list_update",
                        "room_data": room_data
                    }
                )

            return Response(room_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CreateChannelView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = RoomCreateSerializer(data=request.data, context={"request": request, "room_type": Room.RoomType.CHANNEL})
        if serializer.is_valid():
            room = serializer.save()
            room_data = RoomListSerializer(room, context={"request": request}).data
            room_data = convert_uuid_to_str(room_data)

            channel_layer = get_channel_layer()
            user_ids = list(room.members.values_list('id', flat=True))

            for user_id in user_ids:
                async_to_sync(channel_layer.group_send)(
                    f"user_chatlist_{str(user_id)}",
                    {
                        "type": "chat_list_update",
                        "room_data": room_data
                    }
                )

            return Response(room_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class RoomAvatarUpdateView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def patch(self, request, pk):
#         try:
#             room = Room.objects.get(pk=pk)
#         except Room.DoesNotExist:
#             return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

#         if not room.room_members.filter(user=request.user, role="admin").exists():
#             return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

#         serializer = RoomAvatarSerializer(room, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_participant_ids(room):

    if hasattr(room, "members"):
        try:
            return list(room.members.values_list("id", flat=True))
        except Exception:
            pass

    if hasattr(room, "room_members"):
        try:
            return list(room.room_members.values_list("user_id", flat=True))
        except Exception:
            pass

    return []
    
class RoomAvatarUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def patch(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        if not room.room_members.filter(user=request.user, role="admin").exists():
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializer = RoomAvatarSerializer(room, data=request.data, partial=True, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        room = serializer.save()

        avatar_url = serializer.data.get("avatar") or serializer.data.get("avatar_url")
        if avatar_url and not str(avatar_url).startswith("http"):
            avatar_url = request.build_absolute_uri(avatar_url)

        updated_at = timezone.now().isoformat()
        base_payload = {
            "event": "room_avatar_updated",
            "room_id": room.id,
            "room_name": getattr(room, "name", None),
            "avatar": avatar_url,
            "updated_at": updated_at,
            "updated_by": str(request.user.pk),
        }

        channel_layer = get_channel_layer()
        if channel_layer:
            try:
                participant_ids = get_participant_ids(room)
                for uid in participant_ids:
                    async_to_sync(channel_layer.group_send)(
                        f"user_chatlist_{uid}",
                        {
                            "type": "chat_list_update",
                            "room_data": base_payload
                        }
                    )

                async_to_sync(channel_layer.group_send)(
                    f"chat_{room.id}",
                    {
                        "type": "chat_message",
                        "room_data": base_payload
                    }
                )
            except Exception as e:
                print("Failed to broadcast room avatar update: %s", e)

        return Response(serializer.data, status=status.HTTP_200_OK)