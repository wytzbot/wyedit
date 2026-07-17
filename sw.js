const CACHE_NAME = 'wyedit-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-180.png',
  // add your css and js files here
  '/style.css',
  '/app.js'
];

// 1. Install: cache all core files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // activate immediately
});

// 2. Activate: delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: serve from cache first, fallback to network
self.addEventListener('fetch', (e) => {
  // Skip API calls and Google/Firebase requests
  if (e.request.url.includes('/api/') || e.request.url.includes('googleapis')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        // Cache new files dynamically
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Offline fallback for images
      if (e.request.destination === 'image') {
        return caches.match('/icons/icon-192.png');
      }
    })
  );
});
