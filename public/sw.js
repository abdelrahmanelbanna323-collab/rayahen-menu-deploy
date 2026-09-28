self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch to satisfy PWA requirements
  // We can add offline caching later if needed
  event.respondWith(fetch(event.request));
});
