from django.db import models
from c_accounts.models import User
import uuid
from shortuuid.django_fields import ShortUUIDField
# Create your models here.

class Room(models.Model):
    class RoomType(models.TextChoices):
        GROUP = 'group', 'Group'
        PRIVATE = 'private', 'Private'
        CHANNEL = 'channel', 'Channel'
        
    id = ShortUUIDField(
        length=20,
        max_length=22,
        prefix="rr",
        alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        primary_key=True,
        editable=False
    )
    room_type = models.CharField(max_length=255, choices=RoomType.choices)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='room_avatars/', null=True, blank=True)
    members = models.ManyToManyField(User, through='RoomMember', related_name='rooms')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'rooms'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room_type', 'created_at']),
        ]

class RoomMember(models.Model):
    class RoomMemberRole(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'
        
    id = ShortUUIDField(
        length=20,
        max_length=22,
        prefix="rm",
        alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        primary_key=True,
        editable=False
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_members')
    role = models.CharField(max_length=255, choices=RoomMemberRole.choices)
    is_deleted = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.room.name}"
    
    class Meta:
        unique_together = ('room', 'user')
        db_table = 'room_members'
        ordering = ['-joined_at']
        indexes = [
            models.Index(fields=['room', 'joined_at']),
        ]

class Message(models.Model):
    id = ShortUUIDField(
        length=20,
        max_length=22,
        prefix="mm",
        alphabet="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        primary_key=True,
        editable=False
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    is_deleted = models.BooleanField(default=False)
    pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.content
    
    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
        ]