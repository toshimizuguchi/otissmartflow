const CACHE_NAME = 'smartflow-shell-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) =>
          (key.startsWith('smartflow-shell-') && key !== CACHE_NAME) ||
          key === 'terminal-tecnico-v1'
        )
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    request.headers.has('authorization') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/reports/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    const cachePromise = caches.open(CACHE_NAME);
    const networkResponse = fetch(request);
    event.waitUntil(
      networkResponse.then((response) => {
        if (response.ok && response.type === 'basic') {
          return cachePromise.then((cache) => cache.put(request, response.clone()));
        }
      }).catch(() => undefined)
    );
    event.respondWith(
      networkResponse.catch(async () => {
        const cache = await cachePromise;
        const cachedPage = await cache.match(request);
        return cachedPage || cache.match('/index.html');
      })
    );
    return;
  }

  const isAppAsset = url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest';

  if (!isAppAsset || request.cache === 'no-store') return;

  const networkResponse = fetch(request);
  event.waitUntil(
    networkResponse.then((response) => {
      const cacheControl = response.headers.get('Cache-Control') || '';
      if (
        response.ok &&
        response.type === 'basic' &&
        !/\b(private|no-store)\b/i.test(cacheControl)
      ) {
        return caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      }
    }).catch(() => undefined)
  );
  const cachePromise = caches.open(CACHE_NAME);
  event.respondWith(
    cachePromise.then((cache) => cache.match(request))
      .then((cachedResponse) => cachedResponse || networkResponse)
  );
});
