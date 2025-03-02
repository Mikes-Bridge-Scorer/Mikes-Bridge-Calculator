// Cache name - update version when files change
const CACHE_NAME = 'bridge-calculator-v1';

// Base path for GitHub Pages
const BASE_PATH = '/Mikes-Bridge-Calculator';

// Files to cache
const FILES_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/css/styles.css`,
  `${BASE_PATH}/js/app.js`,
  `${BASE_PATH}/js/BridgeScoring.js`,
  `${BASE_PATH}/js/install.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/img/icon-192.png`,
  `${BASE_PATH}/img/icon-512.png`,
  `${BASE_PATH}/img/favicon.ico`
];

// Install the service worker and cache the files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Clean up old caches when service worker activates
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Immediately claim clients
  return self.clients.claim();
});

// Network first, falling back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle the request
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we get a valid response, clone it and update the cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If fetch fails, try to get it from the cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache and offline, return a simple offline page
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_PATH}/index.html`);
          }
          
          // For other assets, just return a simple response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});