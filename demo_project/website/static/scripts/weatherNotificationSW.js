self.addEventListener('push', (event) => {
    const content = event.data.json()
    const title = content.title
    const options = {
        body: content.body,
        icon: content.icon
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