// Nom du cache avec version pour forcer les mises à jour
const CACHE_NAME = 'dnb-simulator-v5';

// Liste des fichiers à mettre en cache (chemins relatifs)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/font-awesome.min.css',
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-180x180.png',
  'icons/icon-192x192.png',
  'icons/icon-384x384.png',
  'icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert et fichiers ajoutés');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Erreur lors de l\'installation du Service Worker:', error);
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si disponible
        if (response) {
          return response;
        }
        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((response) => {
            // Mettre en cache la nouvelle réponse si c'est une requête GET et une réponse valide
            if (event.request.method === 'GET' && response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
      })
  );
});

// Activation du Service Worker (nettoyage des anciens caches)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
