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

   //Get the current url of the client
   const clientUrl = new URL(self.location.href);
   const rootURL = `${clientUrl.protocol}//${clientUrl.host}`;


   

 


  const notificationType = payload.data?.notificationType;
  const sender = payload.data?.sender;
  const notificationTitle = payload.data?.title;
  const notificationBody = payload.data?.body;
  const url = rootURL + payload.data?.url || "/";
  let detailedMessage = `From: ${sender}\nMessage: ${notificationBody}`;
  let icon;

  // Check for chat message
  if (payload.data.chatMessage) {
    await self.registration.showNotification("New Chat Message", {
      body: "You have received a new message regarding your ongoing emergency.",
      icon: "/assets/chat.png",
      data: { url:url },
    });
    return;
  }
  
  //Handle the case where the user is tabbed out and alert is resolved, notify them.
  if(payload.data.status == "Resolved"){
    let resolvedNotificationOptions = {
      body: "Your latest emergency alert has been marked as resolved. If this is incorrect, please contact us.",
      icon: "/assets/current-alert-mobile.png",
      data: { url:url },
    };
    await self.registration.showNotification("Emergency Alert Resolved", resolvedNotificationOptions);

    return;
  }

  //Handle the case where a user is tabbed out and an admin has been assigned
  if(payload.data.status == "Assigned"){
    let title = "Update regarding your ongoing search.";
    let message = `An admin has been assigned to your emergency alert. Please track your emergency alert to view their details.`;

    let options = {
      body: message,
      icon: "/assets/current-alert-mobile.png",
      data: { url:url },
    };

    await self.registration.showNotification(title, options);

    return;

  }


  //Handle the updates that happen when proximity changes from time to time
  if(payload.data.proximity && payload.data.proximity != "999"){
    let title = "Update regarding your ongoing search.";
    let message = `Proximity range changed to ${payload.data.proximity} km. Please track your emergency alert for more details.`;

    let options = {
      body: message,
      icon: "/assets/current-alert-mobile.png",
      data: { url:url },
    };

    await self.registration.showNotification(title, options);

    return;

  }

  //Handle the case where no admin is assigned but everyone has been notified
  if(payload.data.status === "No Admin Assigned"){
    let title = "Update regarding your ongoing search.";
    let message = `All admins have been notified but none have accepted the alert yet. Please be patient.`;

    let options = {
      body: message,
      icon: "/assets/current-alert-mobile.png",
      data: { url:url },
    };

    await self.registration.showNotification(title, options);

    return;

  }

   //Handle the case where the search radius is expanded to include everyone
  if(payload.data.proximity === "999"){
    let title = "Update regarding your ongoing search.";
    let message = `Proximity range expanded to include everyone. Please track your emergency alert for more details.`;

    let options = {
      body: message,
      icon: "/assets/current-alert-mobile.png",
      data: { url:url },
    };

    await self.registration.showNotification(title, options);

    return;
  }



  // Customize notification based on notificationType
  switch (notificationType) {
    case "emergency-alert":
      icon = "/assets/notificationDashboard.png";
      break;
    case "announcement":
      icon = "/assets/current-alert-mobile.png";
      break;
    case "Incident reported":
      icon = "/assets/current-alert-mobile.png";
      break;
    case "Incident status update":
      icon = "/assets/current-alert-mobile.png";
      break;
    case "Incident message":
      icon = "/assets/current-alert-mobile.png";
      break;
    default:
      icon = "/assets/notificationDashboard.png";
      break;
  }

  const notificationOptions = {
    body: detailedMessage,
    icon: icon,
    data: {url:url},
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