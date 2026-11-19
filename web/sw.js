const CACHE = 'taller-acero-v76';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const espera = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('tiempo')), ms))]);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const nav = e.request.mode === 'navigate' || url.pathname.endsWith('index.html');
  if (nav) {
    // Primero la red, pero con 3 s de espera: si no hay internet (o la red está colgada), se abre la copia guardada.
    // Si la red responde más tarde, la versión nueva se guarda para la próxima vez.
    const red = fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); } return r; });
    e.waitUntil(red.catch(() => {}));
    e.respondWith(espera(red, 3000).catch(() => caches.match('index.html').then(hit => hit || red)));
    return;
  }
  if (url.origin !== location.origin) {
    // Tipografías: se guardan la primera vez; sin internet no se espera, se usa la letra del sistema
    if (!FONT_HOSTS.includes(url.hostname)) return;
    e.respondWith(caches.match(e.request).then(hit => hit || espera(fetch(e.request), 4000).then(r => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => Response.error())));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match('index.html'))));
});
