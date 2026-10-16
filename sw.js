// sw.js - lets the app be installed on phones and open the pages you have visited when offline.
// Pages and app files: always fetched fresh when online (so updates show at once); the saved copy is
// used only when there is no connection. The libraries from the CDNs are reused from the cache and
// refreshed in the background. Sign-in, the database and the AI are never cached.
const CACHE = 'fs-v2';
const CORE = ['./', './index.html', './login.html', './config.js', './css/app.css', './js/ai.js', './manifest.json', './icons/icon-192.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const CDN = ['cdn.jsdelivr.net'];
self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin === self.location.origin) {
        // Network first, saved copy when offline
        e.respondWith(fetch(req).then(res => {
            if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
            return res;
        }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(r => r || caches.match('./index.html'))));
        return;
    }
    if (CDN.includes(url.hostname)) {
        // Cached copy at once, refreshed in the background
        e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
            const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
            return hit || net;
        })));
    }
    // Everything else (Supabase, AI, fonts…) goes straight to the network
});
