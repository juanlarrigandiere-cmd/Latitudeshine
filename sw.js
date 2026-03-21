// ── LATITUDE SHINE CLUB — Service Worker ──
// Cambiá el número de versión cada vez que subís cambios a GitHub.
// Eso fuerza la actualización en todos los celulares automáticamente.

const VERSION = 'ls-v1.0';

const CACHE_NAME = `latitudeshine-${VERSION}`;

// Archivos que se cachean para uso offline
const ASSETS = [
  '/Latitudeshine/',
  '/Latitudeshine/index.html',
  '/Latitudeshine/manifest.json',
  '/Latitudeshine/icon-192.png',
  '/Latitudeshine/icon-512.png',
];

// ── INSTALACIÓN: guarda los archivos en caché ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // Si algún asset falla, continúa igual
      });
    })
  );
  // Activa el nuevo SW inmediatamente sin esperar
  self.skipWaiting();
});

// ── ACTIVACIÓN: borra cachés viejos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Borrando caché viejo:', key);
            return caches.delete(key);
          })
      );
    })
  );
  // Toma control de todas las pestañas/ventanas abiertas
  self.clients.claim();
});

// ── FETCH: estrategia "Network First" ──
// Siempre intenta traer la versión más nueva de la red.
// Solo usa el caché si no hay conexión.
self.addEventListener('fetch', event => {
  // Solo intercepta requests GET
  if (event.request.method !== 'GET') return;

  // No intercepta requests a Supabase ni APIs externas
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('wa.me')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, la guarda en caché y la devuelve
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Sin conexión: usa el caché
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Si no hay caché, devuelve el index.html (para PWA offline)
          return caches.match('/Latitudeshine/index.html');
        });
      })
  );
});

// ── MENSAJE: fuerza actualización desde la app ──
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
