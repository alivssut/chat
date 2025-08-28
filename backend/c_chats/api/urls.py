from django.urls import path, include
from .views.chatViews import ChatRoomListView, ChatRoomMessageListView, ChatRoomDetailView, ChatRoomMembersView, CreateGroupView, CreateChannelView, RoomAvatarUpdateView

# Custom URL patterns
urlpatterns = [
    path("rooms/create-group/", CreateGroupView.as_view(), name="create-group"),
    path("rooms/create-channel/", CreateChannelView.as_view(), name="create-channel"),
    path('rooms/<str:room_id>/', ChatRoomDetailView.as_view(), name='chat-room-detail'),
    path('rooms/<str:room_id>/members/', ChatRoomMembersView.as_view(), name='chat-room-detail'),
    path('rooms/', ChatRoomListView.as_view(), name='chat-room-list'),
    path('room/messages/<str:room_id>/', ChatRoomMessageListView.as_view(), name='chat-room-messages-list'),
        path("rooms/<str:pk>/avatar/", RoomAvatarUpdateView.as_view(), name="room-avatar-update"),
]