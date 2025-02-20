from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from .forms import *



def index(request):
    return render(request, 'tabledit/index.html')


def login_user(request):
    context = {'login_form': LoginForm()}
    if request.method == 'POST':
        login_form = LoginForm(request.POST)
        if login_form.is_valid():
            username = login_form.cleaned_data['username']
            password = login_form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                return redirect('index')

            else:
                context ={'login_form': login_form, 'attention': f'Пользователь с именем {username} не был найден'}

    return render(request, 'tabledit/login.html', context)



def logout_user(request):
    logout(request)
    return redirect('index')


class Register(TemplateView):
    template_name = 'tabledit/register.html'

    def get(self, request):
        user_add = RegisterForm()
        context = {'user_add': user_add}
        return render(request, 'tabledit/register.html', context)

    def post(self, request):
        user_add = RegisterForm(request.POST)
        if user_add.is_valid():
            user = user_add.save()
            user.set_password(user.password)
            user.save()
            login(request, user)
            return redirect('index')

        context = {'user_add': user_add}
        return render(request, 'tabledit/register.html', context)


def index(request):
    if request.user.is_authenticated:  # Проверяем, вошел ли пользователь в аккаунт
        if request.method == 'POST':
            form = UploadSheetForm(request.POST, request.FILES)
            if form.is_valid():
                sheet = form.save(commit=False)
                sheet.user = request.user
                sheet.save()
                return redirect('index')  # Перенаправление после успешной загрузки
        else:
            form = UploadSheetForm()

        # Получаем все файлы текущего пользователя
        files = Sheet.objects.filter(user=request.user)

        return render(request, 'tabledit/index.html', {'form': form, 'files': files})
    else:
        # Если пользователь не авторизован, возвращаем только шаблон без формы и файлов
        return render(request, 'tabledit/index.html')


