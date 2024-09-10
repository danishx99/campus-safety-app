importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
  authDomain: "campus-safety-fcm.firebaseapp.com",
  projectId: "campus-safety-fcm",
  storageBucket: "campus-safety-fcm.appspot.com",
  messagingSenderId: "221773083535",
  appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
  measurementId: "G-8BZHJT3BRY"
});

  
  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = firebase.messaging();

  
  messaging.onBackgroundMessage((payload) => {

    if(payload.notification){
      console.log("Notification payload received and automatically handle by FCM: ", payload.notification);
      return;
    }

    console.log(
      '[firebase-messaging-sw.js] Received background message ',
      payload
    );
    // Customize notification here
    const notificationTitle = 'This is a custom title';
    const notificationOptions = {
      body: 'Background Message body.',
      icon: './calendar.png',
      data: { url: 'http://127.0.0.1:3000' }
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  });
  