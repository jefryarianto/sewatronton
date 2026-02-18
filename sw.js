const CACHE_NAME = 'tronton-calculator-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css',
    'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js'
];

// ===== INSTALL SERVICE WORKER =====
self.addEventListener('install', event => {
    console.log('✅ Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Service Worker: Caching files...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete!');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Cache failed:', error);
            })
    );
});

// ===== ACTIVATE SERVICE WORKER =====
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Activating...');
    
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activation complete!');
            return self.clients.claim();
        })
    );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', event => {
    // Skip cross-origin requests except CDN
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('unpkg.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('❌ Service Worker: Fetch failed:', error);
                        
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// ===== PUSH NOTIFICATION EVENT =====
self.addEventListener('push', event => {
    const title = 'Kalkulator Tronton';
    const options = {
        body: event.data ? event.data.text() : 'Ada pembaruan aplikasi!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ===== NOTIFICATION CLICK EVENT =====
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});