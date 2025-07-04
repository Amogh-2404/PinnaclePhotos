from django.contrib.auth import authenticate, get_user_model, login
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_POST
from .forms import LoginForm, UserRegistrationForm, UserEditForm, ProfileEditForm
from django.contrib.auth.decorators import login_required
from .models import Contact, Profile
from django.contrib import messages
from actions.utils import create_action
from actions.models import Action
# Create your views here.

def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = authenticate(
                request,
                username=cd['username'],
                password=cd['password']
            )
            if user is not None:
                if user.is_active:
                    login(request, user)  # sets the user in current session by
                    # incorporating the authenticated User object into the current session context
                    return HttpResponse('Authenticated successfully')
                else:
                    return HttpResponse('Disabled account')
            else:
                return HttpResponse('Invalid login')
    else:
        form = LoginForm()
    return render(request, 'account/login.html', {'form': form}, )


@login_required
def dashboard(request):
    # Display all actions by default
    actions = Action.objects.exclude(user=request.user)
    following_ids = request.user.following.values_list('id', flat=True)
    if following_ids:
        # If user is following others, retrieve only their actions
        actions = actions.filter(user__id__in=following_ids)
        actions = actions.select_related('user', 'user__profile').prefetch_related('target')[:10]
    return render(request,
                  'account/dashboard.html',
                  {'section': 'dashboard','actions':actions}
                  )


def register(request):
    if request.method == 'POST':
        user_form = UserRegistrationForm(request.POST)
        if user_form.is_valid():
            # Create a new user object but avoid saving it yet
            new_user = user_form.save(commit=False)
            # Set the chosen password
            new_user = new_user.set_password(
                user_form.cleaned_data['password']
            )
            new_user.save()
            # Create the user profile
            Profile.objects.create(user=new_user)
            create_action(new_user,'has created an account')
            return render(
                request,
                'account/register_done.html',
                {'new_user': new_user}
            )
        else:
            user_form = UserRegistrationForm()
        return render(
            request,
            'account/register.html',
            {'user_form': user_form}
        )


@login_required
def edit(request):
    if request.method == "POST":
        user_form = UserEditForm(
            instance=request.user,
            data=request.POST
        )
        profile_form = ProfileEditForm(
            instance=request.user.profile,
            data=request.POST,
            files=request.FILES
        )
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request,
                             'Profile updates successfully')
        else:
            messages.error(request, 'Error updating your profile')
    else:
        user_form = UserEditForm(instance=request.user)
        profile_form = ProfileEditForm(instance=request.user.profile)
    return render(
        request,
        'account/edit.html',
        {
            'user_form': user_form,
            'profile_form': profile_form
        }
    )


# Follow system and user detail and list views
User = get_user_model()


@login_required
def user_list(request):
    users = User.objects.filter(is_active=True)
    # TODO:- Add pagination
    return render(request,
                  'account/user/list.html',
                  {'section': 'people', 'users': users})


@login_required
def user_detail(request, username):
    user = get_object_or_404(User, username=username, is_active=True)
    return render(request, 'account/user/detail.html', {'section': 'people', 'user': user})


# Follow user
@require_POST
@login_required
def user_follow(request):
    user_id = request.POST.get('id')
    action = request.POST.get('action')
    if user_id and action:
        try:
            user = User.objects.get(id=user_id)
            if action == 'follow':
                Contact.objects.get_or_create(user_form=request.user, user_to=user)
                create_action(request.user, 'is following', user)
            else:
                Contact.objects.filter(user_form=request.user, user_to=user).delete()
            return JsonResponse({'status': 'ok'})
        except User.DoesNotExist:
            return JsonResponse({'status': 'User does not exist'})

    return JsonResponse({'status': 'error'})
