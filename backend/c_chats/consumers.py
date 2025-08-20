from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Room, Message
import json

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("connect")
        self.user = self.scope["user"]
        print(self.user)
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"
        self.room = await self.get_chat()
        if not self.room:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get("text")

        if not message_text:
            return

        message_obj = await self.create_message(message_text)

        # Get participants in the room (excluding sender or including — your choice)
        participants = await self.get_room_participants()

        # Prepare the room update payload
        room_update_data = {
            "room_id": self.room.id,
            "last_message": {
                "id": message_obj.id,
                "sender": str(self.user.pk),
                "sender_username": self.user.username,  # optional
                "text": message_obj.content,
                "created_at": message_obj.created_at.isoformat()
            },
            "updated_at": message_obj.created_at.isoformat()
        }

        # Notify everyone's chat list (broadcast to each user's chatlist group)
        for user_id in participants:
            await self.channel_layer.group_send(
                f"user_chatlist_{user_id}",
                {
                    "type": "chat_list_update",
                    "room_data": room_update_data
                }
            )

        # Also send to the room group (existing functionality)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": message_obj.id,
                    "sender": str(self.user.pk),
                    "text": message_obj.content,
                    "created_at": message_obj.created_at.isoformat()
                }
            }
        )
    @database_sync_to_async
    def get_room_participants(self):
        """
        Returns a list of user IDs participating in the room.
        Assumes your Room model has a ManyToMany field 'members' linked to User.
        """
        return list(self.room.members.values_list('id', flat=True))
    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     message_text = data.get("text")
    #     print(message_text)

    #     if not message_text:
    #         return

    #     message_obj = await self.create_message(message_text)

    #     await self.channel_layer.group_send(
            
    #         self.room_group_name,
    #         {
    #             "type": "chat_message",
    #             "message": {
    #                 "id": message_obj.id,
    #                 "sender": str(self.user.pk),
    #                 "text": message_obj.content,
    #                 "created_at": message_obj.created_at.isoformat()
    #             }
    #         }
    #     )

    async def chat_message(self, event):
     
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def get_chat(self):
        try:
            return Room.objects.get(id=self.chat_id, is_active=True)
        except Room.DoesNotExist:
            return None

    @database_sync_to_async
    def create_message(self, text):
        return Message.objects.create(
            room=self.room,
            user=self.user,
            content=text
        )

# consumers.py

class ChatListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("ChatListConsumer: connect")
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        # Join user-specific group
        self.user_group_name = f"user_chatlist_{self.user.id}"

        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    # This handler receives broadcast for chat list update
    async def chat_list_update(self, event):
        # Send the updated room data to the client
        await self.send(text_data=json.dumps(event["room_data"]))