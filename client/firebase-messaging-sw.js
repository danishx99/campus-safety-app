// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting(); // Force the waiting service worker to become active immediately
});

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
  authDomain: "campus-safety-fcm.firebaseapp.com",
  projectId: "campus-safety-fcm",
  storageBucket: "campus-safety-fcm.appspot.com",
  messagingSenderId: "221773083535",
  appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
  measurementId: "G-8BZHJT3BRY",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Set up the background message handler
messaging.onBackgroundMessage(async function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

   // Check for chat message
   if (payload.data.chatMessage) {
    await self.registration.showNotification("New Chat Message", {
      body: "You have received a new message regarding your ongoing emergency.",
      icon: "/assets/chat.png",
    });
    return;
  }
  

  const notificationType = payload.data?.notificationType || "General Notification";
  const sender = payload.data?.sender || "Unknown Sender";
  const notificationTitle = payload.data?.title || "No Title";
  const notificationBody = payload.data?.body || "No Message";
  let detailedMessage = `From: ${sender}\nMessage: ${notificationBody}`;
  let icon;
  let tag;

  // Customize notification based on notificationType
  switch (notificationType) {
    case "emergency-alert":
      icon = "/assets/notificationDashboard.png";
      tag = "emergency";
      break;
    case "announcement":
      icon = "/assets/current-alert-mobile.png";
      tag = "announcement";
      break;
    case "incidentReported":
      icon = "/assets/current-alert-mobile.png";
      tag = "incident";
      break;
    case "incidentUpdate":
      icon = "/assets/current-alert-mobile.png";
      tag = "update";
      break;
    case "incidentMessage":
      icon = "/assets/current-alert-mobile.png";
      tag = "update";
      break;
    default:
      icon = "/assets/notificationDashboard.png";
      tag = "default";
      break;
  }

  const notificationOptions = {
    body: detailedMessage,
    icon: icon,
    tag: tag,
    data: {url:"https://chatgpt.com"},
  };

 

  // Show the main notification
  await self.registration.showNotification(notificationTitle, notificationOptions);
});

// Add click event listener for notifications
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  // Get the stored URL from the notification data
  const clickAction = event.notification.data.url || '/';

  // Open the URL
  event.waitUntil(
    clients.openWindow(clickAction)
  );
});