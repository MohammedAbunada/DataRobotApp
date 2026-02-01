from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('home', views.main),
    path('', views.main),
    path('chat', views.chat, name="chat"),
    
]