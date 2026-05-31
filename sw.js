self.addEventListener('push', function(event) {
    if (!event.data) return;
    let data;
    try { data = event.data.json(); } catch(e) {
        data = { title: '📬 Nouveau message', body: event.data.text() };
    }
    const options = {
        body: data.body || '',
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        data: data,
        vibrate: [200, 100, 200],
        tag: data.tag || 'message',
        renotify: true
    };
    event.waitUntil(self.registration.showNotification(data.title || '📬 Nouveau message', options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});

self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(event) { event.waitUntil(clients.claim()); });
