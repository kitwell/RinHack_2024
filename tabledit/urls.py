from django.urls import path
from . import views
from django.conf.urls.static import static
from tedo import settings



urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_user, name='login'),
    path('register/', views.Register.as_view(), name='register'),
    path('logout/', views.logout_user, name='logout'),
]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)