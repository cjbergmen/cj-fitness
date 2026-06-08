const VERSION = '20260607194949';
const CACHE = 'cjf-v' + VERSION;

// Install: skip waiting so new SW activates immediately
self.addEventListener('install', () => self.skipWaiting());

// Activate: delete old caches, claim all clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        // Tell all open tabs/windows to reload for fresh content
        return self.clients.matchAll({type: 'window'});
      })
      .then(clients => clients.forEach(c => c.postMessage({type: 'RELOAD'})))
  );
});

// Fetch: network first, fall back to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
