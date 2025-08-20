from django.urls import path, include
from .views.chatViews import ChatRoomListView, ChatRoomMessageListView, ChatRoomDetailView, ChatRoomMembersView

# Custom URL patterns
urlpatterns = [
    path('rooms/<str:room_id>/', ChatRoomDetailView.as_view(), name='chat-room-detail'),
    path('rooms/<str:room_id>/members/', ChatRoomMembersView.as_view(), name='chat-room-detail'),
    path('rooms/', ChatRoomListView.as_view(), name='chat-room-list'),
    path('room/messages/<str:room_id>/', ChatRoomMessageListView.as_view(), name='chat-room-messages-list'),
]