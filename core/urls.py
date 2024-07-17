from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import RegisterView, ProfileView, PostViewSet, FollowView, CommentViewSet, MessageViewSet, index

router = DefaultRouter()
router.register(r'register', RegisterView, basename='register')
# router.register(r'profile', ProfileView, basename='profile')
router.register(r'posts', PostViewSet)
router.register(r'follow', FollowView, basename='follow')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', ProfileView.as_view({'get': 'retrieve', 'patch': 'update'}), name='profile'),
    path('profile/<int:pk>/', ProfileView.as_view({'get': 'retrieve', 'patch': 'update'}), name='profile-detail'),

]
