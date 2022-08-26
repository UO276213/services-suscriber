const subscribeBtn = document.getElementById('subscribeBtn')
let weatherNotificationSW // Service Worker encargado de gestionar las notificaciones entrantes
let subscription // Refencia a la suscripción en el cliente

// Comprobamos la compatibilidad
checkCompatibility()
    .then(() => {
        if (Notification.permission !== 'granted')
            subscribeBtn.onclick = askPermissions
        else {
            getSubscription().then((existingSubscription) => {
                // Intentamos obtener suscripciones existentes
                subscription = existingSubscription
                updateBtn()
            })
        }
    })
    .catch((e) => {
        console.error(e)
        subscribeBtn.textContent = 'Navegador no compatible ⚠️'
        subscribeBtn.disabled = true
    })


async function checkCompatibility() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Navegador compatible')
    } else {
        // Si el navegador no es compatible, lanzamos un error 
        throw new Error('Navegador incompatible')
    }
}

// Devuveulve una suscripción existente
async function getSubscription() {
    weatherNotificationSW = await navigator.serviceWorker.getRegistration()
    return weatherNotificationSW?.pushManager.getSubscription()
}

// Devuelve una nueva suscripción
async function getNewSubscription() {
    console.log('Creando suscrición nueva')
    await navigator.serviceWorker.register("/weatherNotificationSW.js")
    // Esperamos a que el service worker esté activo
    weatherNotificationSW = await navigator.serviceWorker.ready
    return weatherNotificationSW.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BKH6dYuUAp_WTVs8bHtMSe3I2_yXsSpq2StaRJSR1Kvi9eF1dCfMKnZbSVZtoQMom7LgeiJx3bhxEsi_tTk2MME')
    })
}

// Solicita permisos de notificación, si el usuario lo permite, crea una nueva suscripción y la envía al servidor
async function askPermissions() {
    let permission = await Notification.requestPermission()
    if (permission === "granted") {
        subscription = await getNewSubscription()
        sendSubscriptionToServer()
    }
    updateBtn()
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        subscribeBtn.textContent = 'Permiso denegado 🚫'
        subscribeBtn.disabled = true
    } else if (subscription) {
        subscribeBtn.textContent = 'Dejar de recibir notificaciones 👋'
        subscribeBtn.onclick = unsuscribeHandler
    } else {
        subscribeBtn.textContent = 'Recibir notificaciones🔔'
        subscribeBtn.onclick = async () => {
            subscription = await getNewSubscription()
            sendSubscriptionToServer()
        }
    }
}

// Realiza un POST al servidor para guardar la suscrición
function sendSubscriptionToServer() {
    fetch('/subscribe-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // csrfmiddlewaretoken necesario para apsar la protección contra CSRF
            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
        },
        body: JSON.stringify(subscription.toJSON()),
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

    fetch('/un_subscribe-user', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // csrfmiddlewaretoken necesario para apsar la protección contra CSRF
            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
        },
        body: subscription.endpoint,
    })
        .then(() => {
            console.log('Suscripcion elimianda')
            subscription.unsubscribe()
            subscription = null
        })
        .catch((error) => {
            console.error('Se ha producido un error al desuscribirse: ', error)
        }).finally(() => {
            updateBtn()
        })
}