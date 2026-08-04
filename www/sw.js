// Wipes all caches, notifies pages via postMessage to reload, then unregisters.
self.addEventListener('install', function() { self.skipWaiting(); });

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(names) {
                return Promise.all(names.map(function(n) { return caches.delete(n); }));
            })
            .then(function() { return self.clients.claim(); })
            .then(function() { return self.clients.matchAll({ type: 'window' }); })
            .then(function(clients) {
                clients.forEach(function(c) { c.postMessage('reload'); });
                return self.registration.unregister();
            })
    );
});
