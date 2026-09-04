"use strict";

const CACHE_NAME = "tracktime-v2";
const APP_FILES = ["./", "index.html", "styles.css", "app.js?v=2", "manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});