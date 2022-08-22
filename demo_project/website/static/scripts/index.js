const subscribeBtn = document.getElementById('subscribeBtn')
let weatherNotificationSW // Service Worker encargado de gestionar las notificaciones entrantes
let subscription // Refencia a la suscripción

// Al cargar la página, comprobamos la compatibilidad e intentamos obtener una referencia a la suscripción
document.addEventListener('readystatechange', async () => {
    await checkCompatibility()
    updateBtn()
})

async function checkCompatibility() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Si el navegador es comptabile, procedemos a obtener sw
        console.log('Navegador compatible')
        weatherNotificationSW = await navigator.serviceWorker.getRegistration()
        // Intentamos obtener una suscripción existente
        subscription = await weatherNotificationSW?.pushManager.getSubscription()
    } else {
        console.log('Navegador incomptatible')
        subscribeBtn.textContent = 'Navegador no compatible ⚠️'
        subscribeBtn.disabled = true
    }
}

async function registerNewServiceWorker() {
    return navigator.serviceWorker.register("/weatherNotificationSW.js")
        .then((serviceWorker) => {
            return serviceWorker
        })
        .catch(console.error)
}


subscribeBtn.onclick = async () => {
    if (Notification.permission !== 'granted') {
        // Si el usuario concede los permisos, procedemos a registrar un nuevo sw
        let permission = await Notification.requestPermission() === 'granted'
        if (permission) {
            registerNewServiceWorker().then((newServiceWorker) => {
                // Guardamos el sw registrado
                weatherNotificationSW = newServiceWorker
                handleReceiveNotifications()
            })
        } else {
            console.log('Permiso denegado')
        }
    } else {
        if (subscription)
            unsuscribeHandler()
        else
            registerNewServiceWorker().then((newServiceWorker) => {
                // Guardamos el sw registrado
                weatherNotificationSW = newServiceWorker
                handleReceiveNotifications()
            })
    }

    updateBtn()
}

// Se encarga de la lógica de crear una suscripción y enviarla al servidor
function handleReceiveNotifications() {
    if (weatherNotificationSW) {
        weatherNotificationSW.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BKH6dYuUAp_WTVs8bHtMSe3I2_yXsSpq2StaRJSR1Kvi9eF1dCfMKnZbSVZtoQMom7LgeiJx3bhxEsi_tTk2MME')
        })
            .then((new_subscription) => {
                sendSubscriptionToServer(new_subscription)
                subscription = new_subscription
            })
            .catch(console.error)
        updateBtn()
    } else {
        console.error('No se puede recibir suscribir, falta el SW')
    }
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        subscribeBtn.textContent = 'Permiso denegado 🚫'
        subscribeBtn.disabled = true
    } else if (subscription) {
        subscribeBtn.textContent = 'Dejar de recibir notificaciones 👋'
    } else {
        subscribeBtn.textContent = 'Recibir notificaciones🔔'
    }
}

// Realiza un POST al servidor para guardar la suscrición
function sendSubscriptionToServer(new_subscription) {
    fetch('http://localhost:8000/subscribe-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // csrfmiddlewaretoken necesario para apsar la protección contra CSRF
            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
        },
        body: JSON.stringify(new_subscription.toJSON()),
    })
        .then((res) => {
            if (res.ok) {
                console.log('Usuario suscrito')
            } else {
                // Si se produce un error al registrar, eliminamos la referencia de la suscripción
                subscription.unsubscribe()
                subscription = null
                res.text().then((error) => {
                    throw new Error(error)
                })
            }
        })
        .catch((error) => {
            console.error('Se ha producido un error al suscribirse: ', error)
        }).finally(() => {
            updateBtn()
        })
}

// https://gist.github.com/Klerith/80abd742d726dd587f4bd5d6a0ab26b6
function urlBase64ToUint8Array(base64String) {
    let padding = '='.repeat((4 - base64String.length % 4) % 4);
    let base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    let rawData = window.atob(base64);
    let outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function unsuscribeHandler() {

    fetch('http://localhost:8000/un_subscribe-user', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // csrfmiddlewaretoken necesario para apsar la protección contra CSRF
            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
        },
        body: subscription.endpoint,
    })
        .then((res) => {
            if (res.ok) {
                console.log('Suscripcion elimianda')
                // Eliminamos la referencia local
                subscription.unsubscribe()
                subscription = null
                updateBtn()
            } else {
                res.text().then(error => {
                    throw new Error(error)
                })
            }
        })
        .catch((error) => {
            console.error('Se ha producido un error al desuscribirse: ', error)
        }).finally(() => {
            updateBtn()
        })
}