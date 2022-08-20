const subscribeBtn = document.getElementById('subscribeBtn')

document.addEventListener('readystatechange', () => {
    const permission = Notification.permission
    updateBtn(permission)
})

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
    console.log('Permiso habilitado')
    updateBtn(per)
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