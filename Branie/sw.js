const V = 'branie-v1';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const live = fetch(e.request).then(res => {
        if (res.ok) caches.open(V).then(c => c.put(e.request, res.clone()));
        return res;
      });
      return cached || live;
    })
  );
});

// Branie cross-app relay
self.addEventListener('message', e => {
  if (e.data?.type === 'branie:register') {
    self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'branie:app-registered', app: e.data.app }));
    });
  }
});
