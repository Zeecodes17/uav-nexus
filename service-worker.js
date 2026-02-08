const CACHE_NAME = "uav-nexus-v1";

const FILES_TO_CACHE = [
  "index.html",
  "design.html",
  "analytical_tools.html",
  "physics.html",
  "physics_thrust.html",
  "physics_speed_wind.html",
  "physics_hover_forward_takeoff.html",
  "battery.html",
  "learn.html",
  "wiring.html",
  "failsafe.html",
  "about.html",
  "style.css",
  "script.js",
  "manifest.json",
  "sidebar.partial"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});