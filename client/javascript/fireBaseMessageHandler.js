// firebaseMessagingHandler.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getMessaging, onMessage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
    authDomain: "campus-safety-fcm.firebaseapp.com",
    projectId: "campus-safety-fcm",
    storageBucket: "campus-safety-fcm.appspot.com",
    messagingSenderId: "221773083535",
    appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
    measurementId: "G-8BZHJT3BRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

function playSound() {
    const audio = new Audio("../assets/notification.mp3");
    audio.play().catch(error => {
        console.log("Failed to play the notification sound: ", error);
    });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }


export function handleIncomingMessages(notifier) {
    // Handle incoming messages when the app is in the foreground
    onMessage(messaging, (payload) => {
        console.log('Message received: ', payload);

        // Access custom data
        const notificationType = payload.data?.notificationType || "General Notification";
        const sender = payload.data?.sender || "Unknown Sender";
        const recipient = payload.data?.recipient;

        // Access notification payload
        const notificationTitle = payload.notification?.title || "No Title";
        const notificationBody = payload.notification?.body || "No Message";

        console.log("the title is", notificationTitle);

        // Base notification message format including notificationType
        let detailedMessage = `<strong>Type:</strong> ${notificationType} <br/>
                               <strong>From:</strong> ${sender} <br/>
                               <strong>Message:</strong> ${notificationBody}`;


        //Get the users role and email address from browser cookies
        const role = getCookie('role');
        const email = getCookie('email');
        const firstname = getCookie('firstname');
        const lastname = getCookie('lastname');

    // console.log(`The user is a ${role} with email ${email} and name ${firstname} ${lastname}`);
    // alert("The user is a "+role+" with email "+email+" and name "+firstname+" "+lastname);

    if(role === "admin" && recipient === "admin"){ 

    // Customize message based on notificationType
    switch (notificationType) {
        case "emergency-alert":
        notifier.alert(detailedMessage, { durations: { alert: 20000 }, labels: { alert: notificationTitle } });
        break;

    case "announcement":
        notifier.success(detailedMessage, { durations: { success: 20000 }, labels: { success: notificationTitle } });
        break;

    case "incidentReported":
        notifier.alert(detailedMessage, { durations: { success: 20000 }, labels: { alert: notificationTitle } });
        break;

    case "incidentUpdate":
        notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
        break;

    default:
        notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
        break;
      
}

playSound();  

}else if (role === "student" && recipient === "everyone"){
// Customize message based on notificationType
switch (notificationType) {
    case "emergency-alert":
        notifier.alert(detailedMessage, { durations: { alert: 20000 }, labels: { alert: notificationTitle } });
        break;

    case "announcement":
        notifier.success(detailedMessage, { durations: { success: 20000 }, labels: { success: notificationTitle } });
        break;

    case "incidentReported":
        notifier.alert(detailedMessage, { durations: { success: 20000 }, labels: { alert: notificationTitle } });
        break;

    case "incidentUpdate":
        notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
        break;

    default:
        notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
        break;
      
}

playSound(); 

}else if (role === "staff" && recipient === "everyone"){
    // Customize message based on notificationType
    switch (notificationType) {
        case "emergency-alert":
            notifier.alert(detailedMessage, { durations: { alert: 20000 }, labels: { alert: notificationTitle } });
            break;
    
        case "announcement":
            notifier.success(detailedMessage, { durations: { success: 20000 }, labels: { success: notificationTitle } });
            break;
    
        case "incidentReported":
            notifier.alert(detailedMessage, { durations: { success: 20000 }, labels: { alert: notificationTitle } });
            break;
    
        case "incidentUpdate":
            notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
            break;
    
        default:
            notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
            break;
          
    }
    
    playSound(); 
    
}else if (role === "staff" && recipient === "staff"){
    // Customize message based on notificationType
    switch (notificationType) {
        case "emergency-alert":
            notifier.alert(detailedMessage, { durations: { alert: 20000 }, labels: { alert: notificationTitle } });
            break;
    
        case "announcement":
            notifier.success(detailedMessage, { durations: { success: 20000 }, labels: { success: notificationTitle } });
            break;
    
        case "incidentReported":
            notifier.alert(detailedMessage, { durations: { success: 20000 }, labels: { alert: notificationTitle } });
            break;
    
        case "incidentUpdate":
            notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
            break;
    
        default:
            notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
            break;
          
    }
    
    playSound(); 
    
    }else if(recipient === email){
    // Customize message based on notificationType
    switch (notificationType) {
        case "emergency-alert":
            notifier.alert(detailedMessage, { durations: { alert: 20000 }, labels: { alert: notificationTitle } });
            break;

    case "announcement":
        notifier.success(detailedMessage, { durations: { success: 20000 }, labels: { success: notificationTitle } });
        break;

    case "incidentReported":
        notifier.alert(detailedMessage, { durations: { success: 20000 }, labels: { alert: notificationTitle } });
        break;

    case "incidentUpdate":
        notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
        break;

    default:
        notifier.info(detailedMessage, { durations: { info: 20000 }, labels: { info: notificationTitle } });
        break;
      
}

playSound(); 

}
     

        // Log custom data for debugging
        console.log(`Notification Type: ${notificationType}`);
        console.log(`Sender: ${sender}`);
    });
}
