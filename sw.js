const CACHE_NAME = 'crypto-calculator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/InputGroup.tsx',
  '/components/ResultDisplay.tsx',
  '/components/TradeTypeToggle.tsx',
  '/components/Icons.tsx',
  '/components/CalculatorTypeToggle.tsx',
  '/components/Settings.tsx',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  // esm.sh dependencies from importmap
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache files during install:', err);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // We don't cache non-CORS responses
            if (networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                return networkResponse;
            }

            // Clone the response because it's also a stream.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache chrome-extension URLs
                if (!event.request.url.startsWith('chrome-extension://')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        ).catch(err => {
            console.error('Fetch failed; the resource will not be available offline.', err);
            // If the request is for a document, you might want to return an offline fallback page.
        });
      })
  );
});


// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
