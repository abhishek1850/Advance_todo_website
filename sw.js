// Basic Service Worker to satisfy PWA installation requirements
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through fetch handler
    // This is required for Chrome to detect the app as installable
    event.respondWith(fetch(event.request));
});
