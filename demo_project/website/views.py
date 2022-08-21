import json
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.shortcuts import render
from django.conf import settings
from os import path
from .models import Subscription

# Create your views here.

def index(request):
    return render(request, 'index.html')

def weather_notification_sw(request):
    sw_path = path.join(settings.BASE_DIR, 'website', settings.STATIC_URL[1:-1], 'scripts', 'weatherNotificationSW.js')
    sw = open(sw_path)
    return HttpResponse(sw, content_type='text/javascript')

def subscribe_user(request : HttpRequest):
    if request.method == 'POST':
        subscription_string = request.body
        res_content = ''
        http_response = HttpResponse()

        try :
            subscription_json = json.loads(subscription_string)
            new_subscription = Subscription()
            new_subscription.end_point = subscription_json['endpoint']
            new_subscription.expiration_time = subscription_json['expirationTime']
            new_subscription.auth_key = subscription_json['keys']['auth']
            new_subscription.subscription_pkey = subscription_json['keys']['p256dh']
            new_subscription.save()
            res_content = 'Suscripción registrada'

        except BaseException as e:
            # Bad Request
            http_response.status_code = 400
            res_content = f'No se ha podido suscribir: '
            raise e

        http_response.content = res_content

        return http_response
    