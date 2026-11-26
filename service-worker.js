// Bump CACHE_NAME each time a file changes, so the iPhone picks up the new version.
const CACHE_NAME = "patrimoine-pwa-v30";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./glass.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./assets/bank-logos/binance.svg",
  "./assets/bank-logos/bnp.svg",
  "./assets/bank-logos/cbh.png",
  "./assets/bank-logos/fidelity.png",
  "./assets/bank-logos/hsbc.svg",
  "./assets/bank-logos/revolut.svg",
  "./assets/bank-logos/transat.png",
  "./assets/bank-logos/zurich.svg"
];
const APP_FILES = new Set(["index.html", "styles.css", "glass.css", "app.js", "manifest.json"]);

self.addEventListener("install", event => {
  // cache: "reload" skips the browser's HTTP cache, so a new version never installs stale files
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: "reload" }))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (url.hostname.includes("finnhub.io") || url.hostname.includes("fxapi.app") || url.hostname.includes("frankfurter")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Page and app code: network first (always the latest when online), cache when offline
  const fileName = url.pathname.split("/").pop() || "index.html";
  if (event.request.mode === "navigate" || (url.origin === self.location.origin && APP_FILES.has(fileName))) {
    event.respondWith(
      fetch(event.request.url, { cache: "no-cache" })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request.mode === "navigate" ? "./index.html" : event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request.mode === "navigate" ? "./index.html" : event.request))
    );
    return;
  }

  // Icons and logos: cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
