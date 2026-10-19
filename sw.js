// Le mie uscite: copia offline dell'app. Cambia VERSION quando aggiorni i file.
const VERSION = "uscite-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./xlsx.full.min.js", "./chart.umd.js",
  "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Risponde subito dalla copia salvata e intanto scarica la versione nuova per la prossima apertura.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    }).catch(() => hit || (req.mode === "navigate" ? cache.match("./index.html") : undefined));
    return hit || net;
  }));
});
