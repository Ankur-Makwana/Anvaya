const CACHE_NAME = 'anvaya-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './icons.js',
    './store.js',
    './app.js',
    './manifest.json',
];

// Install: cache all assets immediately
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches + take control immediately
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first, fallback to cache (ensures fresh content)
self.addEventListener('fetch', e => {
    // Only handle same-origin GET requests
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Got a fresh response — cache it for offline use
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Network failed — serve from cache (offline mode)
                return caches.match(e.request);
            })
    );
});

// Listen for messages from the app
self.addEventListener('message', e => {
    if (e.data === 'skipWaiting') self.skipWaiting();
});
