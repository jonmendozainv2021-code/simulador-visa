// Service worker del simulador: guarda la app en el celular para que abra sin internet.
// Al publicar una versión nueva, cambia VERSION para que los celulares la descarguen.
const VERSION = 'simvisa-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icono-192.png', 'icons/icono-512.png', 'icons/icono-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero internet (para recibir mejoras); si no hay señal, la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok && new URL(e.request.url).origin === location.origin) {
          const copia = r.clone();
          caches.open(VERSION).then(c => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
