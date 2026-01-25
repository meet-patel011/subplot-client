const CACHE_NAME = "subplot-static-v1";

/*
  Only cache files that:
  - are required for app shell
  - rarely change
  - are safe to cache
*/
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",

  // CSS
  "/css/home.css",

  // JS
  "/js/main.js",

  // Icons (used by offline screen)
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  const request = event.request;

  // Always try network first
  event.respondWith(
    fetch(request).catch(() => {
      // If user is offline and navigation happens
      if (request.mode === "navigate") {
        return caches.match("/offline.html");
      }

      // Otherwise try cache
      return caches.match(request);
    })
  );
});
