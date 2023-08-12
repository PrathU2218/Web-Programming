
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("u/<username>", views.user_profile, name="profile"),
    path('following/', views.user_following, name="following"),
    path('like/', views.like_post, name="like"),
    path('follow/', views.follow, name="follow"),
    path('edit_post/', views.edit_post, name="edit-post"),
    path('addpost/', views.add_post, name="add-post"),
]