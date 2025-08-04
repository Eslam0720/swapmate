const CACHE_NAME = 'swap-connect-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('push', (event) => {
  const options = {
    body: 'You have a new notification!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/placeholder.svg'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.title = data.title || 'Swap Connect';
  }

  event.waitUntil(
    self.registration.showNotification('Swap Connect', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});