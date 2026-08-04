// Kill switch: deletes all caches, unregisters this SW, reloads all pages.
// After this runs once there is no service worker and no cache — the app
// loads fresh from the network on every visit.
self.addEventListener('install', function() { self.skipWaiting(); });

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(names) {
                return Promise.all(names.map(function(n) { return caches.delete(n); }));
            })
            .then(function() { return self.registration.unregister(); })
            .then(function() { return self.clients.matchAll({ type: 'window' }); })
            .then(function(clients) {
                clients.forEach(function(c) { c.navigate(c.url); });
            })
    );
});
