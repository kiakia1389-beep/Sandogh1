// سرویس‌ورکر: برنامه بدون اینترنت هم باز می‌شود
const V = 'fund-flat-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const CDN = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const same = u.origin === location.origin;
  if (!same && !CDN.includes(u.hostname)) return;
  if (same && r.mode === 'navigate') {
    e.respondWith(fetch(r).then(x => { if (!x.ok) return caches.match('index.html').then(h => h || x); caches.open(V).then(c => c.put('index.html', x.clone())); return x; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: same });
    const net = fetch(r).then(x => { if (x && (x.ok || x.type === 'opaque')) c.put(r, x.clone()); return x; }).catch(() => hit);
    return hit || net;
  }));
});
