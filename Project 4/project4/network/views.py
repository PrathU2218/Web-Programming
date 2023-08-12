from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Profile
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required


def index(request):
    # return render(request, "network/index.html")
    if request.user.is_authenticated:
        
        posts = Post.objects.order_by("-timestamp").all()
        paginator = Paginator(posts, 10)

        if request.GET.get("page") != None:
            try:
                posts = paginator.page(request.GET.get("page"))
            except:
                posts = paginator.page(1)
        else:
            posts = paginator.page(1)

        return render(request, "network/index.html", {"posts": posts})
    
    else:
        return render(request, "network/login.html")

def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "network/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "network/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if (not username) or (not email) or (not password):
            return render(
                request,
                "network/register.html",
                {"message": ("You must fill out all fields.")},
            )
        elif password != confirmation:
            return render(
                request, "network/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(
                request, "network/register.html", {"message": "Username already taken."}
            )
        login(request, user)

        profile = Profile()
        profile.user = user
        profile.save()

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# @login_required
# def all_posts(request):
#     posts = Post.objects.order_by("-timestamp").all()
#     paginator = Paginator(posts, 10)

#     if request.GET.get("page") != None:
#         try:
#             posts = paginator.page(request.GET.get("page"))
#         except:
#             posts = paginator.page(1)
#     else:
#         posts = paginator.page(1)

#     return render(request, "network/index.html", {"posts": posts})


@login_required
def user_profile(request, username):
    try:
        postsUser = User.objects.get(username=username)
        profile = Profile.objects.get(user=postsUser)
        activeUserProfile = Profile.objects.get(user = request.user)
    
    except:
        return render(request, "network/profile.html", {"error": True})

    posts = Post.objects.filter(user=postsUser).order_by("-timestamp")
    paginator = Paginator(posts, 10)

    if request.GET.get("page") != None:
        try:
            posts = paginator.page(request.GET.get("page"))
        except:
            posts = paginator.page(1)
    else:
        posts = paginator.page(1)

    return render(
        request,
        "network/profile.html",
        {
            "error": False,
            "posts": posts,
            "postsUser": postsUser,
            "profile": profile,
            "activeUserProfile": activeUserProfile,
        },
    )


@login_required
def user_following(request):
    following = Profile.objects.get(user=request.user).following.all()
    posts = Post.objects.filter(user__in=following).order_by("-timestamp")
    paginator = Paginator(posts, 10)

    if request.GET.get("page") != None:
        try:
            posts = paginator.page(request.GET.get("page"))
        except:
            posts = paginator.page(1)
    else:
        posts = paginator.page(1)
    return render(request, "network/user_following.html", {"posts": posts})


@login_required
@csrf_exempt
def like_post(request):
    if request.method == "POST":
        postId = request.POST.get("id")
        isLiked = request.POST.get("isLiked")

        try:
            post = Post.objects.get(id=postId)

            if isLiked == "no":
                post.likes.add(request.user)
                isLiked = "yes"
            elif isLiked == "yes":
                post.likes.remove(request.user)
                isLiked = "no"

            post.save()

            return JsonResponse(
                {"likeCount": post.likes.count(), "isLiked": isLiked}, status=200
            )
        except:
            return JsonResponse({"error": "Post not found"}, status=404)

    return render(JsonResponse({}, status=400))


@login_required
@csrf_exempt
def follow(request):
    if request.method == "POST":
        user = request.POST.get("user")
        action = request.POST.get("action")
        selectedUser = User.objects.get(username=user)

        if action == "Follow":
            try:
                activeUserProfile = Profile.objects.get(user=request.user)
                activeUserProfile.following.add(selectedUser)
                activeUserProfile.save()

                selectedUserProfile = Profile.objects.get(user=selectedUser)
                selectedUserProfile.follower.add(request.user)
                selectedUserProfile.save()

                return JsonResponse(
                    {
                        "followerCount": selectedUserProfile.follower.count(),
                        "action": "Unfollow",
                    },
                    status=200,
                )

            except:
                return JsonResponse({}, status=404)

        else:
            try:
                activeUserProfile = Profile.objects.get(user=request.user)
                activeUserProfile.following.remove(selectedUser)
                activeUserProfile.save()

                selectedUserProfile = Profile.objects.get(user=selectedUser)
                selectedUserProfile.follower.remove(request.user)
                selectedUserProfile.save()

                return JsonResponse(
                    {
                        "followerCount": selectedUserProfile.follower.count(),
                        "action": "Follow",
                    },
                    status=200,
                )

            except:
                return JsonResponse({}, status=404)

    return render(JsonResponse({}, status=400))


@login_required
@csrf_exempt
def edit_post(request):
    if request.method == "POST":
        postId = request.POST.get("id")
        newContent = request.POST.get("content")

        try:
            post = Post.objects.get(id=postId)

            if post.user == request.user:
                post.content = newContent.strip()
                post.save()
                return JsonResponse({}, status=200)

        except:
            return JsonResponse({}, status=404)

    return render(JsonResponse({}, status=400))


@login_required
@csrf_exempt
def add_post(request):
    if request.method == "POST":
        content = request.POST.get("content")

        if len(content) != 0:
            newPost = Post()
            newPost.content = content
            newPost.user = request.user
            newPost.save()
            print('post saved')

            return JsonResponse(
                {
                    "postId": newPost.id,
                    "username": request.user.username,
                    "timestamp": newPost.timestamp.strftime("%B %d, %Y, %I:%M %p"),
                    "likes": newPost.likes.count(),
                },
                status=200
            )

    return render(JsonResponse({}, status=400))
