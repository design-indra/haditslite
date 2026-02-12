const CACHE_NAME = "hadits-lite-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ACTIVATE */
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

/* FETCH STRATEGY */
self.addEventListener("fetch", event => {

  // API → network first
  if (event.request.url.includes("api.hadith.gading.dev")) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static → cache first
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return cached || fetch(event.request);
      })
  );
});