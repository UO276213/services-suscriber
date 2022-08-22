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
