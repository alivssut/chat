from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
# Create your models here.
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contacts = models.ManyToManyField(
        "self",
        through="Contact",
        symmetrical=False,
        related_name="related_to",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "c_users"
        indexes = [
            models.Index(fields=["username"], name="idx_user_username"),
            models.Index(fields=["email"], name="idx_user_email"),
        ]

    def __str__(self):
        return self.username
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "c_user_profiles"

    def __str__(self):
        return self.user.username
    
class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="my_contacts"
    )

    contact_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="in_contacts"
    )

    display_name  = models.CharField(max_length=150, blank=True, null=True)

    is_blocked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "c_user_contacts"
        unique_together = ("owner", "contact_user")
        indexes = [
            models.Index(fields=["owner"], name="idx_contact_owner"),
            models.Index(fields=["contact_user"], name="idx_contact_user"),
            models.Index(fields=["display_name"], name="idx_contact_display_name"),
        ]
        ordering = ["display_name"]

    def __str__(self):
        return self.display_name or self.contact_user.username