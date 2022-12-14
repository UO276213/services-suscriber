import json
from django.http import HttpResponse, HttpRequest
from .models import Subscription
from pywebpush import webpush, WebPushException
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

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
   
# Elimina las suscripciones de la base de datos
def unsubscribe_user(request : HttpRequest):
    if request.method == 'DELETE':
        id_subscription = request.body.decode("utf-8")
        manager_subscription = Subscription.objects
        http_response = HttpResponse()

        try:
            saved_subscription : Subscription = manager_subscription.get(end_point=id_subscription)
            saved_subscription.delete()
            http_response.content = f'Subscription con id {saved_subscription.end_point}'
        except Subscription.DoesNotExist:
            http_response.status_code = 410
            http_response.content = f'No existe la suscripción {id_subscription}'
            
        return http_response

@csrf_exempt # Permitimos saltarnos el csrf para los servicios. No muy recomendable
def send_notifications(request : HttpRequest):
    if request.method == 'POST':
        http_response = HttpResponse()
        print(request.body)
        data = json.loads(request.body)
        try:
            data_service_id = data['service_id']

             # TODO: Verificar que el ID del servicio está dentro de los servicios permitidos
            print(data_service_id)

            # Para permitir difererentes servicios, habría que filtrar las suscripciones por servicio suscrito
            subscriptions = Subscription.objects.all()

            data = {
                    'title' :data['title'],
                    'body' : data['body'],
                    'icon' : data['icon']
            }

            for suscription in subscriptions:
                # Enviando mensaje a los suscriptores
                try:
                    webpush(
                        subscription_info={
                            'endpoint' : str(suscription.end_point),
                            'keys': {
                                'p256dh' : str(suscription.subscription_pkey),
                                'auth' : str(suscription.auth_key)
                            }
                        },
                        data= json.dumps(data),
                        vapid_private_key='GfFUOwHGvlVfBfALVhI6-PatG1e5o383J_ZTvvJZKoc',
                        vapid_claims={
                            'sub': 'mailto:email@email.com'
                        }
                    )
                except WebPushException as e:
                    # Si el Push Service lanza un error Gone 410 es que el usuario ya no está suscrito
                    if e.response.status_code == 410:
                        # Borramos la suscripción de nuestra BD
                        suscription.delete()
                    else:
                        raise e
        except WebPushException as e:
            http_response.status_code = e.response.status_code
            http_response.content = e.message
        except KeyError as e:
            http_response.status_code = 400
            http_response.content = 'Cuerpo mal formado: ' + str(e)

        return http_response