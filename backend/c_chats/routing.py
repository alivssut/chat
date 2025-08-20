from django.urls import path

from .consumers import ChatConsumer, ChatListConsumer

websocket_urlpatterns = [
    path('ws/room/<str:chat_id>/', ChatConsumer.as_asgi()),
    path('ws/rooms/', ChatListConsumer.as_asgi()),
]