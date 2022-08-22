# Script que accede a la API de OpenWeather, obtiene el tiempo y permite a los usarios lanzar una notificación
from requests import request
import json

# Localización de la consulta
LOCATION = 'London'
BASE_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather'
ICON_URL = ' http://openweathermap.org/img/wn/'
# Para obtener una API key: https://home.openweathermap.org/users/sign_up o en el primer ejemplo de https://openweathermap.org/weather-conditions
OPENWEATHER_API = 'f64b712dfd42ced85481f46f74d13159'

NOTIFIER_URL = 'http://localhost:8000/send-notifications'

# Realizar consulta a la API
weather_data = json.loads(request('GET', f'{BASE_WEATHER_URL}?q={LOCATION}&units=metric&lang=es&appid={OPENWEATHER_API}').content)
weather_type :str = weather_data['weather'][0]['description']
weather_icon = weather_data['weather'][0]['icon']
weather_temp = weather_data['main']['temp']
# Enviamos los resultados al servidor de notificaciones
request('POST',
    NOTIFIER_URL,
    json={
        'service_id': '1A', # Identificador del servicio, si no existiese en el servidor fallaría #TODO
        'title': f'Weather - {LOCATION}',
        'body': f'{weather_type.capitalize()} - {weather_temp}ºC',
        'icon': f'{ICON_URL}{weather_icon}@2x.png'
    }
)


