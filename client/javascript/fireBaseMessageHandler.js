// firebaseMessagingHandler.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getMessaging,
  onMessage,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

//If firebase is initialized successfully, log the message by CHECKING IF IT IS INITIALIZED
if (app && app.name) {
  console.log(`Firebase initialized successfully. App name: ${app.name}`);
}

function playSound() {
  const audio = new Audio("/assets/notification.mp3");
  audio.play().catch((error) => {
    console.log("Failed to play the notification sound: ", error);
  });
}

function playEmergencySound() {
  const audio = new Audio("/assets/emergencySound.mp3");
  audio.play().catch((error) => {
    console.log("Failed to play the emergency sound: ", error);
  });
}

function playMessageSound() {
  const audio = new Audio("/assets/notification.mp3");
  audio.play().catch((error) => {
    console.log("Failed to play the notification sound: ", error);
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

//Get a reference to all the circles
let searchingCircle = document.getElementById("searchingCircle");
let searchingText = document.getElementById("searchingText");
let assignedCircle = document.getElementById("assignedCircle");
let assignedText = document.getElementById("assignedText");
let resolvedCircle = document.getElementById("resolvedCircle");
let resolvedText = document.getElementById("resolvedText");

export function handleIncomingMessages(notifier) {
  // Handle incoming messages when the app is in the foreground
  onMessage(messaging, (payload) => {
    try {
      console.log("Message received: ", payload);

      console.log("this is printed after message received");

      console.log("the payload data object is", payload.data);

      // Access custom data
      const notificationType =
        payload.data?.notificationType || "General Notification";
      const sender = payload.data?.sender || "Unknown Sender";
      const recipient = payload.data?.recipient;

      // Access notification payload
      const notificationTitle = payload.data?.title || "No Title";
      const notificationBody = payload.data?.body || "No Message";

      console.log("the title is", notificationTitle);

      // Base notification message format including notificationType
      let detailedMessage = `<strong>From:</strong> ${sender} <br/>
                            <strong>Message:</strong> ${notificationBody}`;

      //Get the users role and email address from browser cookies
      const role = getCookie("role");
      const email = decodeURIComponent(getCookie("email"));
      const firstname = getCookie("firstname");
      const lastname = getCookie("lastname");

      // Access status data to check for redirect
      const emergencyAlertIdPayload = payload.data.emergencyAlertId;
      const redirect = payload.data.redirect;
      const userToBeRedirected = payload.data.userToBeRedirected;
      const currentUser = decodeURIComponent(getCookie("email"));

      //If im logged in as a student on both browsers(phone and PC), if i send an emergency alert(panic) on the phone
      // for example, then the PC cant send panic alerts anymore and vice versa.
      //I figured out the ISSUE, FCM TOKEN IS BEING UPDATED WHEN LOGGING INTO ANOTHER DEVICE, THIS IMMEDIALTELY STOPS THE OTHER DEVICE FROM RECEIVING FCM PAYLOADS, SINCE TECHNICALLY
      //THAT USERS TOKEN IS NO LONGER VALIID. THIIIISSS WAS THE ISSSSUEEEEEEEEEEEEEEEEEEEEE

      if (redirect && userToBeRedirected === currentUser) {
        window.location.href = `/user/emergencyalerts/track/${emergencyAlertIdPayload}`;
      }

      //These are the listeners for updating the map and km of proximities

      const url = window.location.href;
      const urlParts = url.split("/");
      const emergencyAlertId = urlParts[urlParts.length - 1];

      // Access status data
      // emergencyAlertIdPayload = payload.data.emergencyAlertId;
      const status = payload.data.status;
      const proximity = payload.data.proximity;

      //Get the messaging information
      const chatMessage = payload.data.chatMessage;
      if (chatMessage) {
        addBotMessage(chatMessage);
        //play sound
        playSound();
        //show red dot on the chat button
        document.getElementById("newChat").style.display = "block";
      }

      if (emergencyAlertIdPayload === emergencyAlertId) {
        if (status === "Assigned") {
          //Change the color of the assigned circle to blue
          assignedCircle.classList.remove("bg-gray-300");
          assignedCircle.classList.add("bg-blue-500");
          assignedText.classList.remove("text-gray-300");
          assignedText.classList.add("text-blue-500");

          //Remove animation from the searching circle
          searchingCircle.classList.remove("animationOn");

          //Add animation to the assigned circle
          assignedCircle.classList.add("animationOn");

          //Hide the map + statusBox + Cancel button (SearchPhase Div)
          document.getElementById("searchPhase").style.display = "none";

          //Show the adminDiv with the assigned admin details
          const adminDiv = document.getElementById("assignedPhase");

          //Extract the admin details from the payload
          const adminFirstName = payload.data.firstName;
          const adminLastName = payload.data.lastName;
          const adminPhone = payload.data.phone;
          const adminEmail = payload.data.email;

          //Populate the admin details
          let adminFirstNameId = document.getElementById("adminFirstName");
          let adminLastNameId = document.getElementById("adminLastName");
          let adminPhoneId = document.getElementById("adminCellphone");
          let adminEmailId = document.getElementById("adminEmail");

          adminFirstNameId.textContent = adminFirstName;
          adminLastNameId.textContent = adminLastName;
          adminPhoneId.textContent = adminPhone;
          adminPhoneId.href = `tel:${adminPhone}`;
          adminEmailId.textContent = adminEmail;

          //Show the admin div
          adminDiv.style.display = "block";
        }

        if (status === "Resolved") {
          //Remove animation from the searching circle
          searchingCircle.classList.remove("animationOn");

          //Remove animation from the assigned circle
          assignedCircle.classList.remove("animationOn");

          //Make the assigned text and circle blue
          assignedCircle.classList.remove("bg-gray-300");
          assignedCircle.classList.add("bg-blue-500");
          assignedText.classList.remove("text-gray-300");
          assignedText.classList.add("text-blue-500");

          //Make resvolved text and circle green
          resolvedCircle.classList.remove("bg-gray-300");
          resolvedCircle.classList.add("bg-green-500");
          resolvedText.classList.remove("text-gray-300");
          resolvedText.classList.add("text-green-500");

          //Hide the map since its resolved
          document.getElementById("map").style.display = "none";

          //Hide the admin details after the emergency is resolved
          document.getElementById("assignedPhase").style.display = "none";
        }

        if (status === "No Admin Assigned") {
          document.getElementById(
            "INFO"
          ).textContent = `All admins have been notified but none have accepted the alert yet. Please be patient.`;
        }

        if (proximity && proximity !== "999") {
          document.getElementById(
            "INFO"
          ).textContent = `Searching for admins within radius: ${proximity} km`;
          //Update the radius of the circle
          circle.setRadius(proximity * 1000);

          //Update the pulse animation
          baseRadius = proximity * 1000;
          maxRadius = proximity * 1000 + 10;
          minRadius = proximity * 1000 - 10;

          //update the zoom based on the radius
          map.setZoom(getZoomLevelFromRadius(proximity * 1000));
        }

        if (proximity === "999") {
          document.getElementById(
            "INFO"
          ).textContent = `Expanded search radius to include all admins`;
        }
      }

      //These are the listeners for updating the map and km of proximities ends

      if (role === "admin" && recipient === "admin") {
        // Customize message based on notificationType
        switch (notificationType) {
          case "emergency-alert":
            notifier.alert(detailedMessage, {
              durations: { alert: 20000 },
              labels: { alert: notificationTitle },
            });
            playEmergencySound();
            break;

          case "announcement":
            notifier.success(detailedMessage, {
              durations: { success: 20000 },
              labels: { success: notificationTitle },
            });
            playSound();
            break;

          case "incidentReported":
            notifier.alert(detailedMessage, {
              durations: { success: 20000 },
              labels: { alert: notificationTitle },
            });
            playSound();
            break;

          case "incidentUpdate":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          case "incidentMessage":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          default:
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;
        }
      } else if (role === "student" && recipient === "everyone") {
        // Customize message based on notificationType
        switch (notificationType) {
          case "emergency-alert":
            notifier.alert(detailedMessage, {
              durations: { alert: 20000 },
              labels: { alert: notificationTitle },
            });
            playEmergencySound();
            break;

          case "announcement":
            notifier.success(detailedMessage, {
              durations: { success: 20000 },
              labels: { success: notificationTitle },
            });
            playSound();
            break;

          case "incidentReported":
            notifier.alert(detailedMessage, {
              durations: { success: 20000 },
              labels: { alert: notificationTitle },
            });
            playSound();
            break;

          case "incidentUpdate":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          case "incidentMessage":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          default:
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;
        }
      } else if (role === "staff" && recipient === "everyone") {
        // Customize message based on notificationType
        switch (notificationType) {
          case "emergency-alert":
            notifier.alert(detailedMessage, {
              durations: { alert: 20000 },
              labels: { alert: notificationTitle },
            });
            playEmergencySound();
            break;

          case "announcement":
            notifier.success(detailedMessage, {
              durations: { success: 20000 },
              labels: { success: notificationTitle },
            });
            playSound();
            break;

          case "incidentReported":
            notifier.alert(detailedMessage, {
              durations: { success: 20000 },
              labels: { alert: notificationTitle },
            });
            playSound();
            break;

          case "incidentUpdate":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          case "incidentMessage":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          default:
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;
        }
      } else if (role === "student" && recipient === "student") {
        // Customize message based on notificationType
        switch (notificationType) {
          case "emergency-alert":
            notifier.alert(detailedMessage, {
              durations: { alert: 20000 },
              labels: { alert: notificationTitle },
            });
            playEmergencySound();
            break;

          case "announcement":
            notifier.success(detailedMessage, {
              durations: { success: 20000 },
              labels: { success: notificationTitle },
            });
            playSound();
            break;

          case "incidentReported":
            notifier.alert(detailedMessage, {
              durations: { success: 20000 },
              labels: { alert: notificationTitle },
            });
            playSound();
            break;

          case "incidentUpdate":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          case "incidentMessage":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          default:
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;
        }
      } else if (role === "staff" && recipient === "staff") {
        // Customize message based on notificationType
        switch (notificationType) {
          case "emergency-alert":
            notifier.alert(detailedMessage, {
              durations: { alert: 20000 },
              labels: { alert: notificationTitle },
            });
            playEmergencySound();
            break;

          case "announcement":
            notifier.success(detailedMessage, {
              durations: { success: 20000 },
              labels: { success: notificationTitle },
            });
            playSound();
            break;

          case "incidentReported":
            notifier.alert(detailedMessage, {
              durations: { success: 20000 },
              labels: { alert: notificationTitle },
            });
            playSound();
            break;

          case "incidentUpdate":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          case "incidentMessage":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          default:
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;
        }
      } else if (recipient === email) {
        // Customize message based on notificationType
        switch (notificationType) {
          case "emergency-alert":
            notifier.alert(detailedMessage, {
              durations: { alert: 20000 },
              labels: { alert: notificationTitle },
            });
            playEmergencySound();
            break;

          case "announcement":
            notifier.success(detailedMessage, {
              durations: { success: 20000 },
              labels: { success: notificationTitle },
            });
            playSound();
            break;

          case "incidentReported":
            notifier.alert(detailedMessage, {
              durations: { success: 20000 },
              labels: { alert: notificationTitle },
            });
            playSound();
            break;

          case "incidentUpdate":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          case "incidentMessage":
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;

          default:
            notifier.info(detailedMessage, {
              durations: { info: 20000 },
              labels: { info: notificationTitle },
            });
            playSound();
            break;
        }
      }
      // Log custom data for debugging
      console.log(`Notification Type: ${notificationType}`);
      console.log(`Sender: ${sender}`);
    } catch (error) {
      console.error("Error handling message: ", error);
    }
  });
}
