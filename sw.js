const CACHE_NAME = 'sol-ia-cache-v2';
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json'];

const absolutePrecacheUrls = PRECACHE_URLS.map(path => new URL(path, self.location).toString());

self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                await cache.addAll(absolutePrecacheUrls);
            } catch (error) {
                console.error('Falha ao fazer precache dos recursos essenciais.', error);
            }
            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(cacheKey => cacheKey !== CACHE_NAME)
                    .map(cacheKey => caches.delete(cacheKey))
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const networkResponse = await fetch(event.request);

                if (
                    networkResponse &&
                    networkResponse.ok &&
                    new URL(event.request.url).origin === self.location.origin
                ) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                if (event.request.mode === 'navigate') {
                    const cache = await caches.open(CACHE_NAME);
                    const fallbackResponse = await cache.match(
                        new URL('/index.html', self.location).toString()
                    );
                    if (fallbackResponse) {
                        return fallbackResponse;
                    }
                }
                throw error;
            }
        })()
    );
});
