importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDe-tvKa4ydct2XQMX5EeRiYBvlE0OsDNk",
  authDomain: "latitude-shine.firebaseapp.com",
  projectId: "latitude-shine",
  storageBucket: "latitude-shine.firebasestorage.app",
  messagingSenderId: "216154563039",
  appId: "1:216154563039:web:ab13cf27739b7213a7a46a"
});

const messaging = firebase.messaging();

// Notificaciones en segundo plano
messaging.onBackgroundMessage(function(payload) {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Latitude Shine', {
    body: body || '',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {}
  });
});

// Click en la notificación abre la app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || 'https://juanlarrigandiere-cmd.github.io/Latitudeshine/';
  event.waitUntil(clients.openWindow(url));
});
