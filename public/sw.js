self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'New Message';
    const options = {
        body: data.body || 'You have a new message in Group Chat',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'group-chat',
        renotify: true,
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('/dashboard'));
});