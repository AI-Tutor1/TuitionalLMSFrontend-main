importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

// Firebase configuration for LMS project
const firebaseConfig = {
  apiKey: "AIzaSyDz3CotnTdgoZpOSBIZgDvK83SzfP7aoHo",
  authDomain: "tuitional-lms-115ae.firebaseapp.com",
  projectId: "tuitional-lms-115ae",
  storageBucket: "tuitional-lms-115ae.firebasestorage.app",
  messagingSenderId: "394983471176",
  appId: "1:394983471176:web:42e4a8baff3bd6e16a007d",
  measurementId: "G-9YFQ2CGKEP",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title || "Notification";
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/assets/images/logo.png",
    data: {
      url: payload.data ? payload.data.link : ""
    }
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  if (urlToOpen) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there is already a window open with this URL
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
