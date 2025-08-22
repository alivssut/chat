from django.urls import path, include
from .views.userViews import UserBasicView, UserContactsView

# Custom URL patterns
urlpatterns = [
    path('details/', UserBasicView.as_view(), name='user-detail'),
    path('contacts/', UserContactsView.as_view(), name='user-contacts'),
]