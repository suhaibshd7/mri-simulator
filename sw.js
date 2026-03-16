// MRI Simulator — Service Worker v3
// Network-first with aggressive offline fallback and font caching

const CACHE = 'mri-sim-v7';

// Core assets to pre-cache on install
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// Optional assets — failure won't block install
const OPTIONAL_ASSETS = [
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './mri_planning_2026-03-01.json',
];

// ── INSTALL ─────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      await cache.addAll(CORE_ASSETS);
      await Promise.allSettled(
        OPTIONAL_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Fonts: cache-first (they never change once loaded)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Same-origin: network-first, cache fallback
  if (url.origin === self.location.origin || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() =>
        caches.match(e.request).then(cached =>
          cached || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
    );
  }
});
