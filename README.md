# Push Weather Notificactions ⛅🔔
---
### Proyecto para probar la [__API Push__](https://developer.mozilla.org/es/docs/Web/API/Push_API) con una simple página que permita a los clientes suscribirse para recibir notificaciones sobre el tiempo.

La información del tiempo lo obtenemos mediante la [API de __OpenWeather__](https://openweathermap.org/api).
La página web hace uso del framework del lenguaje __Python Django__.

## Cómo probar la demo
### Paso 1 - Clonar el repositorio
```git clone https://github.com/UO276213/push-weather-notifications.git```
### Paso 2 - Instalar Django y la depencia [pywebpush](https://github.com/web-push-libs/pywebpush)
```
python -m pip install Django
python -m pip install pywebpush
```
### Paso 3 - Iniciar el servidor
Accedemos al directorio `/demo_project` y ejecutamos el siguiente comando.
```
py .\manage.py runserver
```
### Paso 4 - Accedemos a `http://localhost:8000`
Pulsamos sobre el botón _Recibir notificaciones🔔_ y en la ventana que aparece, pulsamos permitir. Una vez hecho esto, ya estaremos listos para obtener notificaciones.

### Paso 5 - Enviar notificaciones
Para mostrar un ejemplo, existe el archivo `/demo_project/weather_service.py` que permite obtener el tiempo y notificar a los clientes suscritos.

Para ejecutar este servicio, necesitaremos una API key de OpenWeather. En el script se encuentra mi _key_ 🙃, pero, en caso de no funcionar esta, se puede obtener una gratuita al registrarse en https://home.openweathermap.org/users/sign_up_