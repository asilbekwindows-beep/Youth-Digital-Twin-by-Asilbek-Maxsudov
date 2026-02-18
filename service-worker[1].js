const CACHE_NAME = 'youth-digital-twin-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/chatbot.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap'
];

// O'rnatish
self.addEventListener('install', event => {
  console.log('Service Worker: O\'rnatilmoqda...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Fayllar keshlanmoqda');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Service Worker: Keshlashda xato', err);
      })
  );
  self.skipWaiting();
});

// Faollashtirish
self.addEventListener('activate', event => {
  console.log('Service Worker: Faollashtirilmoqda...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eski kesh o\'chirilmoqda', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// So'rovlarni ushlab olish
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Keshda bor bo'lsa qaytarish
        if (response) {
          return response;
        }

        // Keshda yo'q bo'lsa tarmoqdan yuklash
        return fetch(event.request)
          .then(response => {
            // So'rov noto'g'ri bo'lsa yoki tarmoq javob bermasa
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Javobni keshlash
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Offline bo'lsa va keshda yo'q bo'lsa
            return new Response(
              '<html><head><title>Offline</title></head><body>' +
              '<h1>Internet aloqasi yo\'q</h1>' +
              '<p>Ushbu sahifa offline rejimda mavjud emas.</p>' +
              '</body></html>',
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          });
      })
  );
});

// Background Sync
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('Service Worker: Ma\'lumotlar sinxronlanmoqda...');
  // Bu yerda ma'lumotlarni sinxronlash logikasini qo'shing
}

// Push bildirisnomalar
self.addEventListener('push', event => {
  console.log('Service Worker: Push xabar keldi');
  
  const options = {
    body: event.data ? event.data.text() : 'Yangi xabar!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'notification-tag',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Youth Digital Twin', options)
  );
});

// Bildirishnoma bosilganda
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Bildirishnoma bosildi');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
