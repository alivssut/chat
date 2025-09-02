from django.urls import path
from .views.chatViews import ChatRoomListView, ChatRoomMessageListView, ChatRoomDetailView, ChatRoomMembersView, CreateGroupView, CreateChannelView, RoomAvatarUpdateView, ChatRoomDetailUpdateView, UserContactsForRoomView, AddUserToRoomView

# Custom URL patterns
urlpatterns = [
    path("rooms/create-group/", CreateGroupView.as_view(), name="create-group"),
    path("rooms/create-channel/", CreateChannelView.as_view(), name="create-channel"),
    path('rooms/<str:room_id>/', ChatRoomDetailView.as_view(), name='chat-room-detail'),
    path('rooms/<str:room_id>/members/', ChatRoomMembersView.as_view(), name='chat-room-detail'),
    path('rooms/', ChatRoomListView.as_view(), name='chat-room-list'),
    path('room/messages/<str:room_id>/', ChatRoomMessageListView.as_view(), name='chat-room-messages-list'),
    path("rooms/<str:pk>/avatar/", RoomAvatarUpdateView.as_view(), name="room-avatar-update"),
    path("rooms/<str:room_id>/update/", ChatRoomDetailUpdateView.as_view(), name="room-detail-update"),
    path('rooms/<str:room_id>/contacts/', UserContactsForRoomView.as_view(), name='user-room-contacts'),
    path('rooms/<str:room_id>/add-user/', AddUserToRoomView.as_view(), name='add-user-to-room'),
]