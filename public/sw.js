/*
 * All Cut Off — offline service worker. Classic script, no modules, no build step.
 *
 * Caches (both names derive from CACHE_VERSION, so one bump clears everything):
 *   ASSET_CACHE  install-time shell + hashed statics. Not pruned.
 *   PAGE_CACHE   HTML snapshots, capped to PAGE_CACHE_LIMIT newest entries.
 *
 * Strategies
 *   navigations         -> network-first, 4s timeout. The cache key is the bare
 *                           pathname, so ?calc= / ?q= deep links still hit the
 *                           network and are not stored as duplicate entries.
 *                           Offline: cached page, then the cached "/" shell.
 *   same-origin statics -> stale-while-revalidate (/_astro/*, css, js, fonts, images).
 *   crawler-only assets -> network only, never cached.
 *   everything else     -> network only.
 */

const CACHE_VERSION = 'allcutoff-v1';
const ASSET_CACHE = CACHE_VERSION;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const ACTIVE_CACHES = [ASSET_CACHE, PAGE_CACHE];

const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

const NAV_TIMEOUT_MS = 4000;
const OFFLINE_FALLBACK = '/';
const PAGE_CACHE_LIMIT = 12;
const STATIC_FILE = /\.(?:css|js|mjs|woff2?|ttf|otf|svg|png|jpe?g|gif|webp|avif|ico|webmanifest)$/i;
/* Crawler-only: a share/unfurl fetch must never be answered from a stale cache. */
const NEVER_CACHE = new Set(['/og-image.png', '/og-image.svg', '/robots.txt']);

const cacheable = (res) => res && res.ok && res.type !== 'opaque';
const isHtml = (res) => /text\/html/i.test(res.headers.get('content-type') || '');

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const assets = await caches.open(ASSET_CACHE);
    // allSettled per asset so one 404 cannot abort the whole install.
    await Promise.allSettled(CORE_ASSETS.map(async (url) => {
      const res = await fetch(url, { cache: 'reload' });
      if (cacheable(res)) await assets.put(url, res);
    }));
    // Seed the offline shell so a cold offline start has something to render.
    const shell = await caches.open(PAGE_CACHE);
    const home = await assets.match(OFFLINE_FALLBACK);
    if (home) await shell.put(OFFLINE_FALLBACK, home.clone());
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !ACTIVE_CACHES.includes(k)).map((k) => caches.delete(k)));
    if ('navigationPreload' in self.registration) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (err) {
        /* preload unsupported — navigations still work without it */
      }
    }
    await self.clients.claim();
    // Announce the new worker so open pages can surface an update notice.
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* Navigation preload hands us a fetch the browser already started. */
async function readPreload(event) {
  try {
    if (event.preloadResponse) return await event.preloadResponse;
  } catch (err) {
    /* preload rejected — fall through to a normal fetch */
  }
  return null;
}

async function timedFetch(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* Cache.keys() is insertion-ordered, so the oldest pages come first.
   The "/" shell is pinned: it is the offline cold-start fallback, so it must
   never be evicted by the cap. Leaves PAGE_CACHE_LIMIT - 1 pages of headroom. */
async function prunePages() {
  const pages = await caches.open(PAGE_CACHE);
  const shell = new URL(OFFLINE_FALLBACK, self.location.origin).href;
  const prunable = (await pages.keys()).filter((req) => req.url !== shell);
  const excess = prunable.length - (PAGE_CACHE_LIMIT - 1);
  if (excess > 0) await Promise.all(prunable.slice(0, excess).map((req) => pages.delete(req)));
}

async function networkFirst(event) {
  const url = new URL(event.request.url);
  const key = url.origin + url.pathname; // query variants share one entry
  const pages = await caches.open(PAGE_CACHE);

  let res = await readPreload(event);
  if (!res) {
    try {
      res = await timedFetch(event.request, NAV_TIMEOUT_MS);
    } catch (err) {
      res = null;
    }
  }
  // Never cache a failed, redirected or non-HTML response.
  if (cacheable(res) && !res.redirected && isHtml(res)) {
    pages.put(key, res.clone()).then(prunePages).catch(() => {});
    return res;
  }
  return (
    (await pages.match(key, { ignoreVary: true })) ||
    (await caches.match(OFFLINE_FALLBACK)) ||
    Response.error()
  );
}

async function staleWhileRevalidate(request) {
  const assets = await caches.open(ASSET_CACHE);
  const cached = await assets.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (cacheable(res)) assets.put(request, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => null);
  return cached || (await refresh) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_CACHE.has(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event));
  } else if (url.pathname.startsWith('/_astro/') || STATIC_FILE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Anything else falls through to the browser's default network handling.
});
