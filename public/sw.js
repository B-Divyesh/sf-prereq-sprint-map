const CACHE = 'prereq-sprint-map-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/assets/study-strata-720.webp', '/assets/study-strata-1280.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const html = await (await fetch('/')).text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && new URL(event.request.url).origin === location.origin) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || (event.request.mode === 'navigate' ? caches.match('/') : Response.error()))));
});
