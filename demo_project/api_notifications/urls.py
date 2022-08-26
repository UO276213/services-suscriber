from django.urls import path
from . import views

urlpatterns = [
    path('subscribe-user', views.subscribe_user),
    path('un_subscribe-user', views.unsubscribe_user),
    path('send-notifications', views.send_notifications)
]