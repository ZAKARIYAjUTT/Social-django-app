from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Post, Follow, Comment, Message


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = Profile
        fields = ['user', 'bio', 'profile_picture']


class CommentSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'profile', 'content', 'created_at', 'likes_count', 'liked']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_liked(self, obj):
        user = self.context['request'].user
        return user in obj.likes.all()


class PostSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    shares_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'profile', 'title', 'content', 'created_at', 'is_deleted', 'likes_count', 'shares_count',
                  'comments', 'comments_count', 'liked']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_shares_count(self, obj):
        return obj.shares.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_liked(self, obj):
        user = self.context['request'].user
        return user in obj.likes.all()

    def create(self, validated_data):
        validated_data['profile'] = self.context['request'].user.profile
        return super().create(validated_data)


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['follower', 'following', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'created_at', 'is_read']
