// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
  authDomain: "campus-safety-fcm.firebaseapp.com",
  projectId: "campus-safety-fcm",
  storageBucket: "campus-safety-fcm.appspot.com",
  messagingSenderId: "221773083535",
  appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
  measurementId: "G-8BZHJT3BRY"
};


// VAPID key for web push
const vapidKey = 'BF93pnwopvvA-b_z5xXp7K2LKqX3xOHmhYRLQ_8q6KFm6PTRxDgaaIU0Y-9JWrym7Hw7Ur0H-lodMr4OJvfzKys';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

let FCMToken;

// Main function to set up FCM
async function setupFCM() {
  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered with scope:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker is ready');

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied.');
    }
    console.log('Notification permission granted.');

    // Get FCM token
    const currentToken = await messaging.getToken({ vapidKey });
    if (currentToken) {
      console.log("FCM registration token:", currentToken);
      FCMToken = currentToken;
      // alert(FCMToken)
      document.getElementById('token').innerText = currentToken;

      // Store token in localStorage
      localStorage.setItem('fcmToken', currentToken);
     
    } else {
      throw new Error('No registration token available.');
    }

    // Set up message handling
    setupMessageHandling();

  } catch (error) {
    console.error('Error in FCM setup:', error);
    document.getElementById('token').innerText = `Error: ${error.message}`;
  }
}

// Function to handle incoming messages
function setupMessageHandling() {
  // Handle foreground messages
  messaging.onMessage((payload) => {
    console.log('Foreground message received:', payload);
    // You can customize how to display this message to the user
    alert(payload.notification.title + ": " + payload.notification.body);
  });

  // // Handle token refresh
  // messaging.onTokenRefresh(async () => {
  //   try {
  //     const newToken = await messaging.getToken({ vapidKey });
  //     console.log('New FCM Token:', newToken);
  //     document.getElementById('token').innerText = newToken;
  //     // Here you should send this new token to your server
  //   } catch (error) {
  //     console.error('Unable to retrieve new token:', error);
  //   }
  // });

  // messaging.onTokenRefresh(async () => {
  //   try {
  //     const newToken = await messaging.getToken({ vapidKey });
  //     console.log('New FCM Token:', newToken);
  //     // Update the token on your server
  //     // await sendTokenToServer(newToken);
  //   } catch (error) {
  //     console.error('Unable to retrieve new token:', error);
  //   }
  // });
  
}

// Run setup when the page loads
window.onload = setupFCM;