// Simplified service worker
const CACHE_NAME = 'bridge-calculator-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/BridgeScoring.js',
    '/js/regular-calculator.js',
    '/js/financial-calculator.js',
    '/js/install.js'
];

// Install event - Cache important assets individually
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                
                // Cache each file individually so one failure doesn't stop everything
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => {
                        return fetch(url)
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                                console.warn(`Failed to cache: ${url}`);
                            })
                            .catch(error => {
                                console.error(`Error caching ${url}: ${error}`);
                            });
                    })
                );
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - Network first strategy with cache fallback
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the fresh response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If not in cache and network failed, return a basic offline page
                            if (event.request.url.indexOf('.html') > -1) {
                                return caches.match('/index.html');
                            }
                        });
                })
        );
    }
});