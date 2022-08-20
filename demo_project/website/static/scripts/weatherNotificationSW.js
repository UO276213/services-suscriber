self.addEventListener('push', (event) => {

    const title = 'Weather Notification';
    const options = {
        body: event.data.text(),
        icon: '/static/favicon.png'
    };

    const showNotificationPromise = self.registration.showNotification(title, options)
    event.waitUntil(showNotificationPromise);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Al pulsar en la notificación, se abre nuestra página del tiempo
    event.waitUntil(
        clients.openWindow('http://127.0.0.1:8000/')
    );
});