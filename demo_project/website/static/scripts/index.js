const subscribeBtn = document.getElementById('subscribeBtn')
let weatherNotificationSW

document.addEventListener('readystatechange', () => {
    const permission = Notification.permission
    updateBtn(permission)
})

function checkCompatibility() {
    if ('ServiceWorker' in navigator && 'PushManager' in window) {
        // Si el navegador es comptabile, procedemos a registrar el SW
        console.log('Navegador compatible')
        navigator.serviceWorker.register("/weatherNotificationSW.js")
        .then((serviceWorker) => {
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
        // TODO: Registrar en el servidor la suscripción
        updateBtn()
    }
}

function updateBtn(permission) {
    if (permission === 'granted') {
        subscribeBtn.textContent = 'Listo para recibir notificaciones 💫'
        subscribeBtn.disabled = true
    } else if (permission === 'denied') {
        subscribeBtn.textContent = 'Permiso denegado 🚫'
        subscribeBtn.disabled = true
    }
}