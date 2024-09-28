// firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
  authDomain: "campus-safety-fcm.firebaseapp.com",
  projectId: "campus-safety-fcm",
  storageBucket: "campus-safety-fcm.appspot.com",
  messagingSenderId: "221773083535",
  appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
  measurementId: "G-8BZHJT3BRY",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// IndexedDB setup
const DB_NAME = "UserDataDB";
const STORE_NAME = "userData";
const DB_VERSION = 1;

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
  });
}

async function getData(key) {
  if (!db) {
    db = await openDB();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value);
  });
}

async function getUserData() {
  try {
    const role = await getData("role");
    const email = await getData("email");
    const firstname = await getData("firstname");
    const lastname = await getData("lastname");
    return { role, email, firstname, lastname };
  } catch (error) {
    console.error("Failed to retrieve user data:", error);
    return null;
  }
}

messaging.onBackgroundMessage(async (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Access custom data
  const notificationType =
    payload.data?.notificationType || "General Notification";
  const sender = payload.data?.sender || "Unknown Sender";
  const recipient = payload.data?.recipient;

  // Access notification payload
  const notificationTitle = payload.data?.title || "No Title";
  const notificationBody = payload.data?.body || "No Message";

  // Base notification message format including notificationType
  let detailedMessage = `From: ${sender}\nMessage: ${notificationBody}`;

  // Get the user's data from IndexedDB
  const userData = await getUserData();
  const role = userData?.role;
  const email = decodeURIComponent(userData?.email);
  

  let showNotification = false;

  if (role === "admin" && recipient === "admin") {
    showNotification = true;
  } else if (role === "student" && recipient === "student") {
    showNotification = true;
  } else if (role === "student" && recipient === "everyone") {
    showNotification = true;
  } else if (role === "staff" && recipient === "staff") {
    showNotification = true;
  } else if (role === "staff" && recipient === "everyone") {
    showNotification = true;
  } else if (recipient === email) {
    showNotification = true;
  }

  if (showNotification) {
    let icon = "/default-icon.png";
    let tag = "default";

    // Customize notification based on notificationType
    switch (notificationType) {
      case "emergency-alert":
        icon = "/emergency-icon.png";
        tag = "emergency";
        break;
      case "announcement":
        icon = "/announcement-icon.png";
        tag = "announcement";
        break;
      case "incidentReported":
        icon = "/incident-icon.png";
        tag = "incident";
        break;
      case "incidentUpdate":
        icon = "/update-icon.png";
        tag = "update";
        break;
      case "incidentMessage":
        icon = "/update-icon.png";
        tag = "update";
        break;
      default:
        break;
    }

    const notificationOptions = {
      body: detailedMessage,
      icon: icon,
      tag: tag,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
