from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('weatherNotificationSW.js', views.weather_notification_sw),
    path('subscribe-user', views.subscribe_user),
    path('un_subscribe-user', views.unsubscribe_user)
]