// Laoäpi teenustöötaja: hoiab lehe telefonis, et see avaneks ka ilma võrguta.
// Võrgus võetakse alati uusim versioon, võrguta kasutatakse salvestatud koopiat.
const VAHEMALU = 'ladu-v1';
const FAILID = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VAHEMALU).then(c => c.addAll(FAILID)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== VAHEMALU).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Ainult oma lehe failid. Google'i päringud lähevad otse (andmed on localStorage'is).
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(vastus => {
        if (vastus.ok) {
          const koopia = vastus.clone();
          caches.open(VAHEMALU).then(c => c.put(e.request.url.split('?')[0].split('#')[0], koopia));
        }
        return vastus;
      })
      .catch(() => caches.match(e.request.url.split('?')[0].split('#')[0])
        .then(r => r || caches.match('./index.html')))
  );
});
