from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=400, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="user_liked")
    
    def __str__(self) -> str:
        return f"Post from {self.user.username}"
    
class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    follower = models.ManyToManyField(User, blank=True, related_name="user_follower")
    following = models.ManyToManyField(User, blank=True, related_name="user_following")
    image = models.ImageField(default="profile_image/default.jpeg", upload_to="profile_image")

    def __str__(self):
        return self.user.username
