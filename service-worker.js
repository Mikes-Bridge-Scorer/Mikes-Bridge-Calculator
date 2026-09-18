// service-worker.js - Bridge Calculator PWA Service Worker
const CACHE_NAME = 'bridge-calculator-v1.3.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/BridgeScoring.js',
  '/js/regular-calculator.js',
  '/js/financial-calculator.js',
  '/js/install.js',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(function(response) {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Add to cache for future use
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(function(error) {
            console.log('Service Worker: Fetch failed, serving offline fallback', error);
            
            // Return offline fallback for HTML requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle background sync for future features
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Future: Add background sync functionality here
      Promise.resolve()
    );
  }
});

// Handle push notifications (future feature)
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push event received', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Bridge Calculator',
      icon: '/img/icon-192.png',
      badge: '/img/icon-192.png',
      data: data.url || '/'
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Bridge Calculator', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// Handle message events from the main app
self.addEventListener('message', function(event) {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handler
self.addEventListener('error', function(event) {
  console.error('Service Worker: Error occurred', event);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', function(event) {
  console.error('Service Worker: Unhandled promise rejection', event);
});

console.log('Service Worker: Script loaded successfully');