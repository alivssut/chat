from django.urls import path, include
from .views.userViews import UserBasicView

# Custom URL patterns
urlpatterns = [
    path('details/', UserBasicView.as_view(), name='user-detail'),
]