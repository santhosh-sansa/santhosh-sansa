const SANSA_CACHE = 'sansa-adobe-full-platform-2026-v1';
const SANSA_ASSETS = [
  './',
  './index.html',
  './page.html',
  './styles.css',
  './styles.css?v=sansa-adobe-full-platform-2026-v1',
  './app.js',
  './app.js?v=sansa-adobe-full-platform-2026-v1',
  './page-shell.js',
  './page-shell.js?v=sansa-adobe-full-platform-2026-v1',
  './sansa-config.js',
  './sansa-config.js?v=sansa-adobe-full-platform-2026-v1',
  './sansa-logo.png',
  './manifest.webmanifest',
  './robots.txt',
  './sitemap.xml'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SANSA_CACHE)
      .then((cache) => cache.addAll(SANSA_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== SANSA_CACHE && key.startsWith('sansa-'))
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SANSA_CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('./index.html')))
  );
});

