const CACHE_NAME = 'lms-vendor-cache-v1';
const urlsToCache = [
  '/vendor/stock',
  '/vendor/requests',
  '/vendor/orders',
  '/vendor/invoices'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened:', CACHE_NAME);
      return cache.addAll(urlsToCache.map(url => `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002/api'}${url}`));
    })
  ).then(() => {
    console.log('Service Worker installed successfully');
    self.skipWaiting();
  });
});

// Fetch event with network-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only cache API calls
  const isApiCall = urlsToCache.some(cacheUrl => url.pathname.includes(cacheUrl));
  
  if (isApiCall) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          // Return cached version if available (for offline)
          if (response) {
            console.log('Serving from cache:', request.url);
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(request).then((networkResponse) => {
            console.log('Fetching from network:', request.url);
            
            // Cache the response for future use
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              cache.put(request, responseClone);
            }
            
            return networkResponse;
          });
        });
      })
    );
  } else {
    // For non-API calls, fetch normally
    fetch(request);
  }
});

// Activate service worker immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    event.clients.claim().then(() => {
      event.clients.openWindow('https://example.com');
    })
  );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      console.log('Old caches cleaned up');
    });
  );
});
