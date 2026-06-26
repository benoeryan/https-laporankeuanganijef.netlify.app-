// Firebase Cloud Messaging Service Worker
// Handles background push notifications when app/browser is closed
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAWlNi_iBOWxZBD6E20aHOSrRpPsirDdOM',
  authDomain: 'test-kesehatan-ijef-corp-7c278.firebaseapp.com',
  projectId: 'test-kesehatan-ijef-corp-7c278',
  storageBucket: 'test-kesehatan-ijef-corp-7c278.firebasestorage.app',
  messagingSenderId: '48180557823',
  appId: '1:48180557823:web:47ea8db8126737dbc0d9ca',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background push notifications using the FCM SDK's built-in mechanism.
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || 'Keuangan IJEF Notifikasi';
  const body = notification.body || data.body || '';
  const options = {
    body: body,
    icon: 'https://ui-avatars.com/api/?name=KU&background=1a237e&color=ffffff&size=192',
    badge: 'https://ui-avatars.com/api/?name=KU&background=1a237e&color=ffffff&size=192',
    vibrate: [200, 100, 200, 100, 300],
    silent: false,
    tag: 'keuangan-notif-' + Date.now(),
    renotify: true,
    data: {
      click_action: data.click_action || notification.click_action || '/',
      url: data.url || data.click_action || '/',
    },
  };

  return self.registration.showNotification(title, options);
});

// Handle notification click - open/focus the app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || event.notification.data?.click_action || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If an app window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});
