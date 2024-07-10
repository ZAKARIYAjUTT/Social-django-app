from django.shortcuts import render
from rest_framework import mixins, viewsets, permissions, status
from rest_framework.response import Response
from .models import Profile, Post, Follow, Comment, Message
from .serializers import ProfileSerializer, PostSerializer, FollowSerializer, UserSerializer, CommentSerializer, \
    MessageSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import action


class RegisterView(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        Profile.objects.create(user=user)
        user.is_active = True
        user.save()


class ProfileView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

    def retrieve(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class PostViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin, mixins.DestroyModelMixin,
                  mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Post.objects.filter(is_deleted=False)
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if user in post.likes.all():
            post.likes.remove(user)
        else:
            post.likes.add(user)
        post.save()
        return Response({'likes_count': post.likes.count()}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def share(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if user not in post.shares.all():
            post.shares.add(user)
            post.save()
        return Response({'shares_count': post.shares.count()}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def comment(self, request, pk=None):
        post = self.get_object()
        user = request.user
        content = request.data.get('content')
        if content:
            Comment.objects.create(post=post, profile=user.profile, content=content)
        return Response({'comments': CommentSerializer(post.comments.all(), many=True).data},
                        status=status.HTTP_201_CREATED)


class CommentViewSet(mixins.DestroyModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        if user in comment.likes.all():
            comment.likes.remove(user)
        else:
            comment.likes.add(user)
        comment.save()
        return Response({'likes_count': comment.likes.count()}, status=status.HTTP_200_OK)


class FollowView(mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        follower = request.user.profile
        following = Profile.objects.get(pk=request.data['pk'])
        Follow.objects.create(follower=follower, following=following)
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        follower = request.user.profile
        following = Profile.objects.get(pk=kwargs['pk'])
        Follow.objects.filter(follower=follower, following=following).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(recipient=user)

    def perform_create(self, serializer):
        sender = self.request.user
        recipient = User.objects.get(pk=self.request.data['recipient_id'])
        serializer.save(sender=sender, recipient=recipient)


def index(request):
    return render(request, 'index.html')
