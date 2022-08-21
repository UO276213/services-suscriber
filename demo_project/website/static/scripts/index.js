const subscribeBtn = document.getElementById('subscribeBtn')
let weatherNotificationSW
let isSubscribed = false
let subscription

document.addEventListener('readystatechange', () => {
    const permission = Notification.permission
    updateBtn(permission)
    checkCompatibility()
})

function checkCompatibility() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Si el navegador es comptabile, procedemos a registrar el SW
        console.log('Navegador compatible')
        navigator.serviceWorker.register("/weatherNotificationSW.js")
        .then((serviceWorker) => {
            // Guardamos el sw registrado
            weatherNotificationSW = serviceWorker
        })
        .catch(console.error)
    } else {
        subscribeBtn.textContent = 'Navegador no compatible ⚠️'
        subscribeBtn.disabled = true
    }
}

subscribeBtn.addEventListener('click', () => {
    Notification.requestPermission()
        .then((permission) => {
            if (permission === 'granted') {
                handleReceiveNotifications()
            } else if (permission === 'denied') {
                console.log('Permiso denegado')
            }
            updateBtn(permission)
        })
})

function handleReceiveNotifications() {
    if (weatherNotificationSW){
        console.log('Permiso concedido')
        weatherNotificationSW.pushManager.subscribe({
            userVisibleOnly : true,
            applicationServerKey : urlBase64ToUint8Array('BKH6dYuUAp_WTVs8bHtMSe3I2_yXsSpq2StaRJSR1Kvi9eF1dCfMKnZbSVZtoQMom7LgeiJx3bhxEsi_tTk2MME')
        })
        .then((new_subscription) => {
            sendSubscriptionToServer(new_subscription)
            subscription = new_subscription
        })
        .catch(console.error)
        updateBtn()
    }
}

function updateBtn(permission) {
    if (permission === 'granted') {
        subscribeBtn.textContent = 'Listo para recibir notificaciones 💫'
    } else if (permission === 'denied') {
        subscribeBtn.textContent = 'Permiso denegado 🚫'
        subscribeBtn.disabled = true
    }
}


function sendSubscriptionToServer(new_subscription){
    fetch('http://localhost:8000/subscribe-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // csrfmiddlewaretoken necesario para apsar la protección contra CSRF
            'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value,
        },
        body: JSON.stringify(new_subscription.toJSON()),
    })
    .then(() => {
        console.log('Usuario suscrito')
        isSubscribed = true
        subscribeBtn.textContent = 'Dejar de recibir notificaciones 👋'
        subscribeBtn.addEventListener('click', unsuscribeHandler)
    })
    .catch(() => {
        console.error('Se ha producido un error al suscribirse: ', e)
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

function unsuscribeHandler(){

    fetch('http://localhost:8000/un_subscribe-user', {
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
        isSubscribed = false
        subscribeBtn.textContent = 'Volver a recibir notificaciones 🔔'
        subscribeBtn.addEventListener('click', handleReceiveNotifications)
    })
    .catch(() => {
        console.error('Se ha producido un error al desuscribirse: ', e)
    })
}