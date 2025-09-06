// sw.js

// Cache version - increment when updating assets
const CACHE_VERSION = 'qneet-v1.2.0';
const CACHE_NAME = `qneet-cache-${CACHE_VERSION}`;

// Static assets to cache during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/dark-theme.css',
  '/js/main.js',
  '/js/pdf-viewer.js',
  '/js/storage.js',
  '/js/utils.js',
  '/data/resources.json',
  '/data/categories.json',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  // Add other static assets here
];

// Assets that should bypass cache (API calls, dynamic content)
const DYNAMIC_ASSETS = [
  // Add dynamic URLs that should always come from network
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip caching for dynamic assets
  if (DYNAMIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    return;
  }
  
  // Handle requests to same origin
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            console.log('[Service Worker] Serving cached response for:', request.url);
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          console.log('[Service Worker] Fetching from network:', request.url);
          return fetch(request)
            .then(networkResponse => {
              // Cache the response for future requests
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    console.log('[Service Worker] Caching new response for:', request.url);
                    cache.put(request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(error => {
              console.error('[Service Worker] Network fetch failed:', error);
              // Fallback for HTML documents
              if (request.headers.get('Accept').includes('text/html')) {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// Handle push notifications (if implemented)
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received');
  
  let title = 'QNEET Update';
  let options = {
    body: 'New resources are available!',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png'
  };
  
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    options.body = data.body || options.body;
    options.icon = data.icon || options.icon;
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If app isn't open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle background sync (if implemented)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-resources') {
    console.log('[Service Worker] Background sync for resources');
    event.waitUntil(
      // Implement sync logic here
      syncResources()
    );
  }
});

// Function to sync resources (example implementation)
async function syncResources() {
  try {
    // This would typically sync user data with a backend
    console.log('[Service Worker] Syncing resources...');
    
    // Example: Update resource data
    const response = await fetch('/data/resources.json');
    const resources = await response.json();
    
    // In a real app, you would process and store these resources
    console.log('[Service Worker] Resources synced:', resources.length);
    
    // Show notification
    self.registration.showNotification('QNEET', {
      body: 'Resources updated successfully!',
      icon: '/assets/icons/icon-192.png'
    });
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Handle periodic background sync (if implemented)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-resources') {
    console.log('[Service Worker] Periodic sync for resources');
    event.waitUntil(
      updateResources()
    );
  }
});

// Function to update resources periodically
async function updateResources() {
  try {
    console.log('[Service Worker] Checking for resource updates...');
    
    // In a real implementation, this would check for new resources
    // and update the cache accordingly
    
    // Example notification
    self.registration.showNotification('QNEET', {
      body: 'Resource library is up to date!',
      icon: '/assets/icons/icon-192.png'
    });
  } catch (error) {
    console.error('[Service Worker] Periodic update failed:', error);
  }
}

// Handle messages from client
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Handle fetch errors for external resources
self.addEventListener('fetch', event => {
  // Handle CORS errors for external resources
  if (event.request.url.includes('external-domain.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a fallback response
          return new Response('External resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        })
    );
  }
});

// Handle cache cleanup when storage is low
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'cleanupCache') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      event.source.postMessage({ action: 'cleanupComplete' });
    });
  }
});

console.log('[Service Worker] Initialized with cache version:', CACHE_VERSION);