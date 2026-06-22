// SELF-DESTRUCTING SERVICE WORKER
// A previous version of this app installed a cache-first service worker that
// permanently served a stale index.html, so code updates never appeared.
// This version deletes all caches, unregisters itself, and reloads open tabs
// so the app always loads the latest files from the network.
// (Service worker registration is currently disabled in index.html.)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {}
    try {
      await self.registration.unregister();
    } catch (e) {}
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => client.navigate(client.url));
    } catch (e) {}
  })());
});

// While this SW is briefly active, always go to the network (never serve stale cache).
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
