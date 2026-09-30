// Laoäpi teenustöötaja: hoiab lehe ja skänneri teegi telefonis, et need avaneksid ka ilma võrguta.
// Oma lehe failid: võrgus alati uusim, võrguta salvestatud koopia.
// Skänneri teek (CDN): esimesel korral laaditakse, edaspidi võetakse telefonist.
const VAHEMALU = 'ladu-v2';
const FAILID = ['./', './index.html'];
const CDN = ['cdn.jsdelivr.net', 'unpkg.com'];

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
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (CDN.includes(url.hostname)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(vastus => {
        if (vastus.ok) { const k = vastus.clone(); caches.open(VAHEMALU).then(c => c.put(e.request, k)); }
        return vastus;
      }))
    );
    return;
  }

  // Google'i päringud lähevad otse (andmed on localStorage'is)
  if (url.origin !== self.location.origin) return;
  const voti = e.request.url.split('?')[0].split('#')[0];
  e.respondWith(
    fetch(e.request)
      .then(vastus => {
        if (vastus.ok) { const koopia = vastus.clone(); caches.open(VAHEMALU).then(c => c.put(voti, koopia)); }
        return vastus;
      })
      .catch(() => caches.match(voti).then(r => r || caches.match('./index.html')))
  );
});
