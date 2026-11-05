// Service worker mínimo: la app funciona sin conexión tras la primera visita.
// Estrategia: red primero para HTML (para recibir versiones nuevas), caché primero para assets con hash.
const CACHE = 'piano-coach-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate';
  e.respondWith(
    isPage
      ? fetch(req).then((res) => cachePut(req, res)).catch(() => caches.match(req).then((r) => r || caches.match('./')))
      : caches.match(req).then((hit) => hit || fetch(req).then((res) => cachePut(req, res))),
  );
});

function cachePut(req, res) {
  if (res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}
