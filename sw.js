// MRI Simulator — Service Worker
// Network-first strategy: always tries live update, falls back to cache offline

const CACHE = 'mri-sim-v2'; // bumped from v1 → forces old cache to clear
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

// Install: pre-cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['./index.html', './manifest.json'])
        .then(() => cache.add('./icon-192.png').catch(() => {}))
        .then(() => cache.add('./icon-512.png').catch(() => {}))
        .then(() => cache.add('./icon-512-maskable.png').catch(() => {}))
    ).then(() => self.skipWaiting())
  );
});

// Activate: delete any old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first — always tries to get the latest from server.
// Only falls back to cache if the network request fails (offline).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(response => {
      // Got a live response — update the cache and return it
      if (response.ok && e.request.url.startsWith(self.location.origin)) {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => {
      // Network failed (offline) — serve from cache
      return caches.match(e.request).then(cached => {
        if (cached) return cached;
        // Last resort: return index.html for navigation requests
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
