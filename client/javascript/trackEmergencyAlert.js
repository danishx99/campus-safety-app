// // firebaseMessagingHandler
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// import {
//     getMessaging,
//     onMessage,
// } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";
window.initMap = function () {
  const emergencyDetails = JSON.parse(getCookieDetails());

  const location = JSON.parse(emergencyDetails.location);
  const lat = location.latitude;
  const lng = location.longitude;

  const locationObj = { lat: lat, lng: lng };

  // Initialize the map and set the location
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: getZoomLevelFromRadius(baseRadius),
    center: locationObj,
  });

  // Initialize the marker and circle
  const marker = new google.maps.Marker({
    position: locationObj,
    map: map,
    draggable: false,
  });

  // Create the circle with an initial radius
  circle = new google.maps.Circle({
    map: map,
    radius: baseRadius, // Initial radius in meters
    fillColor: "blue", // Fill color for the circle
    fillOpacity: 0.3, // Opacity of the fill
    strokeColor: "black", // Stroke color for the circle
    strokeOpacity: 0.8, // Opacity of the stroke
    strokeWeight: 2, // Thickness of the stroke
  });

  // Attach the circle to the marker's location
  circle.bindTo("center", marker, "position");

  // Start the pulse animation
  pulseCircle();
};

//Get a reference to all the circles
let searchingCircle = document.getElementById("searchingCircle");
let searchingText = document.getElementById("searchingText");
let assignedCircle = document.getElementById("assignedCircle");
let assignedText = document.getElementById("assignedText");
let resolvedCircle = document.getElementById("resolvedCircle");
let resolvedText = document.getElementById("resolvedText");

/*
HELPER FUNCTIONS
*/
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function getCookieDetails() {
  //Get the last part of the current url to extract the alert id
  const url = window.location.href;
  const urlParts = url.split("/");
  const emergencyAlertId = urlParts[urlParts.length - 1];

  //Get the cookie details
  let emergencyAlertCookieDetails = decodeURIComponent(
    getCookie(`emergency-${emergencyAlertId}`)
  );

  return emergencyAlertCookieDetails;
}

function getZoomLevelFromRadius(radius) {
  const zoomLevels = [
    { radius: 200, zoom: 16 },
    { radius: 500, zoom: 15 },
    { radius: 1000, zoom: 14 },
    { radius: 2000, zoom: 13 },
    { radius: 5000, zoom: 12 }, // zooms out as radius increases
    { radius: 10000, zoom: 11 },
    { radius: 20000, zoom: 11 },
    { radius: 50000, zoom: 10 },
    { radius: 100000, zoom: 9 },
  ];

  for (let i = 0; i < zoomLevels.length; i++) {
    if (radius <= zoomLevels[i].radius) {
      return zoomLevels[i].zoom;
    }
  }
  return 7; // default to a wide zoom if radius is larger than 100000m
}

//Variables for the pulse animation
let growing = true;
let baseRadius = 0;
let maxRadius = 0; // Maximum pulse size
let minRadius = 0; // Minimum pulse size
let pulseSpeed = 0.2; // How fast the pulse effect grows/shrinks

//Function to animate the pulse
function pulseCircle() {
  let currentRadius = circle.getRadius();

  if (growing) {
    // Increase the radius
    currentRadius += pulseSpeed;
    if (currentRadius >= maxRadius) {
      growing = false; // Start shrinking
    }
  } else {
    // Decrease the radius
    currentRadius -= pulseSpeed;
    if (currentRadius <= minRadius) {
      growing = true; // Start growing again
    }
  }

  // Set the new radius
  circle.setRadius(currentRadius);

  // Call this function again for smooth animation
  requestAnimationFrame(pulseCircle);
}

let map;
let circle;

// Function to get the current emergency alert details
async function getEmergencyAlertDetails(emergencyAlertId) {
  try {
    const response = await fetch(
      `/emergency/getEmergencyAlert/${emergencyAlertId}`
    );
    const data = await response.json();
    return data; // Return the fetched data
  } catch (error) {
    console.log("Error fetching emergency alert data upon page load:", error);
    return null; // Return null or an appropriate value to indicate failure
  }
}


function showCancelledLoader() {
  const cancelLoader = document.getElementById("loaderCancelled");
  cancelLoader.style.display = "block";
}

function hideCancelledLoader() {
  const cancelLoader = document.getElementById("loaderCancelled");
  cancelLoader.style.display = "none";
}

/* Helper functions for the chat feature(Loading of messages) */


function addUserMessagePageLoad(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("mb-2", "text-right");
  messageElement.innerHTML = `<p class="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block ml-5">${message}</p>`;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function addBotMessagePageLoad(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("mb-2");
  messageElement.innerHTML = `<p class="bg-gray-200 text-gray-700 rounded-lg py-2 px-4 inline-block mr-5">${message}</p>`;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}



let adminData;
let emergencyAlertId;

//When dom loads
document.addEventListener("DOMContentLoaded", async function () {
  // intializeFirebaseForUpdates();

  // Populate the details of the emergency alert
  const emergencyDetails = JSON.parse(getCookieDetails());
  document.getElementById("alertTitle").innerHTML =
    "<b>Alert Title: </b>" + (emergencyDetails.title || "No title provided.");
  document.getElementById("alertDescription").innerHTML =
    "<b>Description: </b>" +
    (emergencyDetails.description || "No description provided.");

  // Get the current emergency alert details
  const url = window.location.href;
  const urlParts = url.split("/");
  emergencyAlertId = urlParts[urlParts.length - 1];

  // Await the emergency alert data and handle null case
  let emergencyAlertData = await getEmergencyAlertDetails(emergencyAlertId);
  adminData = emergencyAlertData.adminData;

  emergencyAlertData = emergencyAlertData.emergencyAlert;


  const currentStatusOfEmergencyAlert = emergencyAlertData.status;
  const currentRadiusOfEmergencyAlert = emergencyAlertData.radiusBeingSearched;
  const currentAssignedTo = emergencyAlertData.assignedTo;

  if (currentStatusOfEmergencyAlert === "Searching") {
    //Show the map + statusBox + Cancel button (SearchPhase Div)
    document.getElementById("searchPhase").style.display = "block";
  }

  if (currentStatusOfEmergencyAlert === "Assigned") {
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

    //Extract the admin details
    const adminFirstName = adminData.firstName;
    const adminLastName = adminData.lastName;
    const adminPhone = adminData.phone;
    const adminEmail = adminData.email;

    const adminDiv = document.getElementById("assignedPhase");
    
    //Show the admin div
    adminDiv.style.display = "block";

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

    //Since we had a page load and the page loaded with status assigned, we need to retrieve messages.
    // /getChatMessages/:emergencyAlertId
   

    const response = await fetch(`/emergency/getChatMessages/${emergencyAlertId}`);

    const data = await response.json();

    if(data.message === "Chat not found"){
      addBotMessagePageLoad("Welcome to the chat. Please feel free to ask any questions.");
    }else if(data.messages){
      data.messages.forEach((message) => {
        if (message.sender === "user") {
          addUserMessagePageLoad(message.text);
        } else {
          addBotMessagePageLoad(message.text);
        }
      });
    }else{
      addErrorMessage("Error loading chat messages. Please try again.");
    }

  }

  if (currentStatusOfEmergencyAlert === "Resolved") {
    //Remove animation from the searching circle
    searchingCircle.classList.remove("animationOn");

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


  }

  if (currentRadiusOfEmergencyAlert && currentRadiusOfEmergencyAlert !== 999) {
    //Update the radius of the circle
    circle.setRadius(currentRadiusOfEmergencyAlert * 1000);
    //update the proximity text of id INFO
    document.getElementById(
      "INFO"
    ).textContent = `Searching for admins within radius: ${currentRadiusOfEmergencyAlert} km`;
    //Update the pulse animation
    baseRadius = currentRadiusOfEmergencyAlert * 1000;
    maxRadius = currentRadiusOfEmergencyAlert * 1000 + 10;
    minRadius = currentRadiusOfEmergencyAlert * 1000 - 10;

    //update the zoom based on the radius
    map.setZoom(getZoomLevelFromRadius(baseRadius));
  }

  if (currentRadiusOfEmergencyAlert === 999) {
    document.getElementById(
      "INFO"
    ).textContent = `Expanded search radius to include all admins`;

    // baseRadius = currentRadiusOfEmergencyAlert * 1000;
    // maxRadius = currentRadiusOfEmergencyAlert * 1000 + 10;
    // minRadius = currentRadiusOfEmergencyAlert * 1000 - 10;
  }

  if (currentAssignedTo === "No Admin Assigned") {
    document.getElementById(
      "INFO"
    ).textContent = `All admins have been notified but none have accepted the alert yet. Please be patient.`;
  }

  // cancellation process
  const cancelButton = document.getElementById("cancelRequest");
  cancelButton.addEventListener("click", async function () {
    try{
      showCancelledLoader();
      const response = await fetch(
        `/emergency/cancelEmergencyAlert/${emergencyAlertId}`
      );
      //const data = await response.json();
      if (response.status === 200) {
        hideCancelledLoader();
  
        window.location.href = "/user/emergencyAlerts";
      } else {
        hideCancelledLoader();
        let errorMessage = document.getElementById("cancelAlert");
        errorMessage.textContent =
          "Error cancelling the alert. Please try again.";
        errorMessage.style.display = "block";
      }
    }catch (error) {
      hideCancelledLoader();
      console.log("Error cancelling the alert:", error);
      let errorMessage = document.getElementById("cancelAlert");
      errorMessage.textContent =
        "Error cancelling the alert. Please try again.";
      errorMessage.style.display = "block";
    }
  });
});
