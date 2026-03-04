// ============================================
// ATTACKERS ARENA — SERVICE WORKER v4
// Offline-first with network fallback
// ============================================

const CACHE_NAME = 'attackers-arena-v4';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.svg',
];

// ── Install: pre-cache static shell ──────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            cache.addAll(STATIC_ASSETS)
        ).then(() => self.skipWaiting())
    );
});

// ── Activate: delete old caches ──────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: network-first with cache fallback ─
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET, chrome-extension, and API requests
    if (
        request.method !== 'GET' ||
        url.protocol === 'chrome-extension:' ||
        url.pathname.startsWith('/api/') ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('groq.com')
    ) {
        return;
    }

    // For JS/CSS assets with content hash: cache-first (they are immutable)
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // For HTML navigation: network-first, fallback to cached index.html
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(request).then(
                    (cached) => cached || caches.match('/index.html')
                )
            )
    );
});
