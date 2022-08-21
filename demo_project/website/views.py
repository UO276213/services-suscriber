from django.http import HttpResponse, HttpRequest, JsonResponse
from django.shortcuts import render
from django.conf import settings
from os import path

# Create your views here.

def index(request):
    return render(request, 'index.html')

def weather_notification_sw(request):
    sw_path = path.join(settings.BASE_DIR, 'website', settings.STATIC_URL[1:-1], 'scripts', 'weatherNotificationSW.js')
    sw = open(sw_path)
    return HttpResponse(sw, content_type='text/javascript')

def subscribe_user(request : HttpRequest):
    if request.method == 'POST':
        newSubscription = request.body
        # TODO: Guardar la suscripción
        response = HttpResponse('Usuario suscrito')
        return response
    