// sw.js — PT Tools service worker
// Strategy: cache-first with background network update (stale-while-revalidate).
// Bump CACHE_VERSION any time you deploy a new release.
const CACHE_VERSION = "pt-tools-v0.5.0";

const APP_SHELL = [
  "./",
  "./index.html",
  "./info.html",
  "./app.js",
  "./helpers.js",
  "./style.css",
  "./manifest.json",
  "./calculators/bmi.js",
  "./calculators/gait.js",
  "./calculators/cardio.js",
  "./calculators/utilities.js",
  "./calculators/strength.js",
  "./calculators/balance.js",
  "./calculators/outcomes.js",
  "./billing.js",
  "./calculators/billing.js",
];

// ── Install ────────────────────────────────────────────────────────────────
// Pre-cache all app shell files. If any file fails to cache we skip it
// rather than failing the whole install — keeps the SW resilient to
// optional/future assets in APP_SHELL that may not exist yet.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const results = await Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Could not cache ${url}:`, err);
          })
        )
      );
      return results;
    })
  );
  // Don't call skipWaiting() here — we want to wait for the page to
  // confirm the update before taking control (avoids mid-session surprises).
});

// ── Activate ───────────────────────────────────────────────────────────────
// Delete all caches that don't match the current version.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
// Cache-first: serve from cache immediately, then fetch from network in the
// background and update the cache. If the network returns a new response,
// notify all open clients so they can offer a reload prompt.
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin or relative URLs.
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(event.request);

      // Kick off a background network fetch regardless of cache hit.
      const networkFetch = fetch(event.request)
        .then(async (networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type !== "opaque"
          ) {
            // Check if the response actually changed before updating cache
            // and notifying clients (avoids false "update available" toasts).
            const cached = await cache.match(event.request);
            const newText = await networkResponse.clone().text().catch(() => null);
            const oldText = cached
              ? await cached.text().catch(() => null)
              : null;

            await cache.put(event.request, networkResponse.clone());

            if (newText !== null && oldText !== null && newText !== oldText) {
              // Content changed — tell every open tab there's an update.
              const clients = await self.clients.matchAll({ type: "window" });
              clients.forEach((client) =>
                client.postMessage({ type: "SW_UPDATE_AVAILABLE" })
              );
            }
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed — that's fine, we have the cache.
        });

      // Return cached version immediately if we have it; otherwise wait for
      // the network (first load / uncached resource).
      if (cached) {
        return cached;
      }

      // No cache hit — wait for network.
      return networkFetch;
    })
  );
});

// ── Messages ───────────────────────────────────────────────────────────────
// The page sends SKIP_WAITING when the user taps the update banner.
// This tells the waiting SW to take control immediately.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
