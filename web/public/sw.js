const CACHE_NAME = "epl-predictor-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === "navigate" || url.pathname.endsWith("/index.html");
  if (url.pathname.endsWith("/sw.js")) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (isNavigation) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy))
            .catch(() => undefined),
        );
        return response;
      }).catch(() => caches.match(event.request)),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
