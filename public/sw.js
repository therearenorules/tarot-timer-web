// Service Worker for Tarot Timer PWA
// Provides offline functionality, background sync, and push notifications

const CACHE_NAME = 'tarot-timer-v1.0.0';
const STATIC_CACHE_NAME = 'tarot-timer-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'tarot-timer-dynamic-v1.0.0';

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Static resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/_expo/static/js/web/index.js',
  '/_expo/static/js/web/runtime.js',
  '/_expo/static/css/web/index.css'
];

// Dynamic content patterns
const API_ROUTES = [
  '/api/daily-sessions',
  '/api/spreads',
  '/api/auth',
  '/api/sync'
];

// Background sync tags
const BACKGROUND_SYNC = {
  DAILY_SESSION_SYNC: 'daily-session-sync',
  SPREAD_SYNC: 'spread-sync',
  ANALYTICS_SYNC: 'analytics-sync'
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('tarot-timer-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - Handle network requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for background sync
  if (request.method !== 'GET') {
    return handleNonGetRequest(event);
  }

  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Background sync for offline data synchronization
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  switch (event.tag) {
    case BACKGROUND_SYNC.DAILY_SESSION_SYNC:
      event.waitUntil(syncDailySessions());
      break;
    case BACKGROUND_SYNC.SPREAD_SYNC:
      event.waitUntil(syncSpreads());
      break;
    case BACKGROUND_SYNC.ANALYTICS_SYNC:
      event.waitUntil(syncAnalytics());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');

  const options = {
    body: 'Your tarot session is ready!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.title = payload.title || 'Tarot Timer';
      options.body = payload.body || options.body;
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.error('[SW] Error parsing push payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Tarot Timer', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const { action, data } = event;

  if (action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const url = data?.url || '/';

        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Helper functions

// Check if request is for static assets
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.startsWith('/_expo/static/') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2');
}

// Check if request is for API endpoints
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Check if request is navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' &&
          request.headers.get('accept') &&
          request.headers.get('accept').includes('text/html'));
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Return cached version immediately
      const networkResponse = fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => {
        // Network failed, but we have cache
      });

      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset handling error:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    try {
      // Try network first
      const networkResponse = await fetch(request);

      if (networkResponse && networkResponse.status === 200) {
        // Cache successful responses for GET requests
        if (request.method === 'GET') {
          cache.put(request, networkResponse.clone());
        }
      }

      return networkResponse;
    } catch (networkError) {
      console.warn('[SW] Network failed for API request, trying cache');

      // Network failed, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        // Add offline header
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-Served-By', 'sw-cache');
        headers.set('X-Cache-Status', 'offline');

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers
        });
      }

      // No cache available
      return new Response(
        JSON.stringify({
          error: 'Offline - No cached data available',
          offline: true,
          timestamp: Date.now()
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('[SW] API request handling error:', error);
    return new Response(
      JSON.stringify({ error: 'Service worker error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle navigation requests (app shell)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Network failed, return cached app shell
    console.warn('[SW] Network failed for navigation, serving offline shell');

    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/');

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback offline page
    return new Response(
      `<!DOCTYPE html>
       <html>
         <head>
           <title>Tarot Timer - Offline</title>
           <style>
             body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a1625; color: white; }
             .offline { background: linear-gradient(135deg, #7b2cbf, #f4d03f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
           </style>
         </head>
         <body>
           <h1 class="offline">🔮 Tarot Timer</h1>
           <h2>Offline Mode</h2>
           <p>You're currently offline. Some features may be limited.</p>
           <button onclick="window.location.reload()">Try Again</button>
         </body>
       </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle dynamic requests with stale-while-revalidate
async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => {
      // Network failed
      return null;
    });

    // Return cached response immediately if available
    if (cachedResponse) {
      fetchPromise; // Update cache in background
      return cachedResponse;
    }

    // Wait for network response
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }

    // Both cache and network failed
    return new Response('Offline - Resource not available', { status: 503 });
  } catch (error) {
    console.error('[SW] Dynamic request handling error:', error);
    return new Response('Service worker error', { status: 500 });
  }
}

// Handle non-GET requests (POST, PUT, DELETE)
function handleNonGetRequest(event) {
  const { request } = event;

  // Try to send request immediately
  event.respondWith(
    fetch(request).catch(async (error) => {
      console.warn('[SW] Non-GET request failed, scheduling for background sync');

      // Store request for background sync
      await storeRequestForSync(request);

      return new Response(
        JSON.stringify({
          error: 'Request failed - scheduled for background sync',
          offline: true,
          syncScheduled: true,
          timestamp: Date.now()
        }),
        {
          status: 202, // Accepted
          headers: { 'Content-Type': 'application/json' }
        }
      );
    })
  );
}

// Store failed request for background sync
async function storeRequestForSync(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };

    // Store in IndexedDB for background sync
    // This is a simplified version - in production, use a proper IndexedDB wrapper
    console.log('[SW] Storing request for background sync:', requestData);

    // Schedule background sync
    if ('serviceWorker' in self && 'sync' in self.registration) {
      let syncTag = BACKGROUND_SYNC.DAILY_SESSION_SYNC;

      if (request.url.includes('/spreads')) {
        syncTag = BACKGROUND_SYNC.SPREAD_SYNC;
      } else if (request.url.includes('/analytics')) {
        syncTag = BACKGROUND_SYNC.ANALYTICS_SYNC;
      }

      await self.registration.sync.register(syncTag);
      console.log('[SW] Background sync scheduled:', syncTag);
    }
  } catch (error) {
    console.error('[SW] Failed to store request for sync:', error);
  }
}

// Background sync implementations
async function syncDailySessions() {
  console.log('[SW] Syncing daily sessions...');
  // Implementation would retrieve stored requests and retry them
  // This is a placeholder for the actual sync logic
  return Promise.resolve();
}

async function syncSpreads() {
  console.log('[SW] Syncing spreads...');
  // Implementation would retrieve stored requests and retry them
  return Promise.resolve();
}

async function syncAnalytics() {
  console.log('[SW] Syncing analytics...');
  // Implementation would retrieve stored requests and retry them
  return Promise.resolve();
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(performDailySync());
  }
});

async function performDailySync() {
  console.log('[SW] Performing daily background sync');
  // Clean up old cache entries, sync important data, etc.
  await Promise.all([
    cleanOldCacheEntries(),
    syncImportantData()
  ]);
}

async function cleanOldCacheEntries() {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  // Clean entries older than 7 days
  // Implementation would check timestamps and clean accordingly
}

async function syncImportantData() {
  // Sync critical app data
  await Promise.all([
    syncDailySessions(),
    syncSpreads(),
    syncAnalytics()
  ]);
}

console.log('[SW] Service Worker script loaded successfully');