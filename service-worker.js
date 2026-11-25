// Bump CACHE_NAME each time index.html changes, so the iPhone picks up the new version.
const CACHE_NAME = "patrimoine-pwa-v25";
const APP_SHELL = [
  "./",
  "./index.html",
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

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
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

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
