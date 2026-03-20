// MRI Simulator — Service Worker v33
// Optimised for Android Chrome PWA — cache-first app shell, persistent storage.

// SW VERSION: v35 — must match app version; bump CACHE name on every index.html change
const CACHE = 'mri-sim-v35';
const BASE  = self.registration.scope;

// App shell — must always be cached
const CORE_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'sw.js',
  BASE + 'data/manifest.json',  // data manifest — resolves current filenames
];

// Nice-to-have — failure won't block install
const OPTIONAL_ASSETS = [
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'icon-512-maskable.png',
];

// ── INSTALL ───────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Cache core assets — this is what makes offline work
    await cache.addAll(CORE_ASSETS);
    // Optional assets best-effort
    await Promise.allSettled(
      OPTIONAL_ASSETS.map(url => cache.add(url).catch(() => {}))
    );
    // Skip waiting — activate immediately without waiting for old tabs
    await self.skipWaiting();
  })());
});

// ── ACTIVATE ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // Remove stale caches from previous versions
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    );
    // Claim all clients so this SW controls existing pages immediately
    // This is critical on Android: without claim(), the SW won't intercept
    // fetch events from tabs that were open before this SW activated.
    await self.clients.claim();
  })());
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Fonts: cache-first (immutable once downloaded)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(e.request));
    return;
  }

  // Page navigation: cache-first with background refresh
  // This is the most important case — ensures the app opens offline instantly.
  // On Android, launching the home screen icon always triggers a navigate request.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(BASE + 'index.html').then(cached => {
        if (cached) {
          // Serve cached app immediately — refresh in background
          fetch(e.request)
            .then(res => {
              if (res.ok) caches.open(CACHE).then(c => c.put(BASE + 'index.html', res.clone()));
            })
            .catch(() => {/* offline — cached version already served */});
          return cached;
        }
        // Not cached yet — must go to network (first install)
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => {
              c.put(BASE + 'index.html', clone);
              c.put(e.request, res.clone());
            });
          }
          return res;
        });
      })
    );
    return;
  }

  // data/manifest.json: always bypass SW cache and go straight to network.
  // This file resolves the current calibration filename — a stale manifest
  // causes the app to fetch old calibration data even after an update.
  if (url.pathname.endsWith('data/manifest.json')) {
    e.respondWith(networkFirstNoCache(e.request));
    return;
  }

  // Other JSON files: network-first so updates reach the client, cache fallback offline
  if (url.pathname.endsWith('.json')) {
    e.respondWith(networkFirstJson(e.request));
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(e.request));
  }
});

// ── STRATEGY HELPERS ──────────────────────────────────────────────────────────

// Always fetch from network (bypassing SW cache) — never cache data/manifest.json
// in the SW. A stale manifest causes the app to resolve old filenames and skip
// version checks, so we intentionally have NO SW-cache fallback for this file.
// The app's own localStorage already caches the manifest for offline use.
async function networkFirstNoCache(request) {
  try {
    const res = await fetch(request, { cache: 'no-store' });
    // Do NOT put() into SW cache — app-level localStorage handles offline fallback
    return res;
  } catch {
    // Truly offline — return empty object; app falls back to localStorage manifest
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(CACHE)).put(request, res.clone());
    return res;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstJson(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(CACHE)).put(request, res.clone());
    return res;
  } catch {
    const cached = await caches.match(request);
    // Return cached JSON or empty object — never hard-fail
    return cached || new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE);
  const cached = await cache.match(request);
  // Always attempt to refresh in background
  const fresh = fetch(request).then(res => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  // Serve cache immediately if available, otherwise wait for network
  return cached || fresh;
}
