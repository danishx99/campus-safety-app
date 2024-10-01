
// // firebaseMessagingHandler
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// import {
//     getMessaging,
//     onMessage,
// } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";


//Get a reference to all the circles 
let searchingCircle = document.getElementById("searchingCircle");
let searchingText = document.getElementById("searchingText");
let assignedCircle = document.getElementById("assignedCircle");
let assignedText = document.getElementById("assignedText");
let resolvedCircle = document.getElementById("resolvedCircle");
let resolvedText = document.getElementById("resolvedText");


function intializeFirebaseForUpdates() {

    // Get the current emergency alert id from browser url
    const url = window.location.href;
    const urlParts = url.split("/");
    const emergencyAlertId = urlParts[urlParts.length - 1];


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

    // Handle incoming messages when the app is in the foreground
    messaging.onMessage((payload) => {
        console.log("Message received: ", payload);

        // Access status data
        const emergencyAlertIdPayload = payload.data.emergencyAlertId;
        const status = payload.data.status;
        const proximity = payload.data.proximity;


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
            }

            if (status === "Resolved") {
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

            if(proximity){

               document.getElementById("INFO").textContent = `Proximity has changed to : ${proximity} km`;
                //Update the radius of the circle
                circle.setRadius(proximity*1000);

                //Update the pulse animation
                baseRadius = proximity*1000;
                maxRadius = (proximity*1000) + 10;
                minRadius = (proximity*1000) - 10;

            }


        }


    });
}


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
    let emergencyAlertCookieDetails = decodeURIComponent(getCookie(`emergency-${emergencyAlertId}`));

    return emergencyAlertCookieDetails;
}

//Variables for the pulse animation
let growing = true;
let baseRadius = 0;
let maxRadius = 260; // Maximum pulse size
let minRadius = 240; // Minimum pulse size
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

function initMap() {

    const emergencyDetails = JSON.parse(getCookieDetails());

    const location = JSON.parse(emergencyDetails.location);
    const lat = location.latitude;
    const lng = location.longitude;

    const locationObj = { lat: lat, lng: lng };

    // Initialize the map and set the location
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
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



}
// Function to get the current emergency alert details
async function getEmergencyAlertDetails(emergencyAlertId) {
    try {
        const response = await fetch(`/emergency/getEmergencyAlert/${emergencyAlertId}`);
        const data = await response.json();
        return data; // Return the fetched data
    } catch (error) {
        console.log("Error fetching emergency alert data upon page load:", error);
        return null; // Return null or an appropriate value to indicate failure
    }
}



//When dom loads
document.addEventListener('DOMContentLoaded', async function () {

    intializeFirebaseForUpdates();


    // Populate the details of the emergency alert
    const emergencyDetails = JSON.parse(getCookieDetails());
    document.getElementById("alertTitle").innerHTML = "<b>Alert Title: </b>" + (emergencyDetails.title || "No title provided.");
    document.getElementById("alertDescription").innerHTML = "<b>Description: </b>" + (emergencyDetails.description || "No description provided.");

    // Get the current emergency alert details
    const url = window.location.href;
    const urlParts = url.split("/");
    const emergencyAlertId = urlParts[urlParts.length - 1];

    // Await the emergency alert data and handle null case
    let emergencyAlertData = await getEmergencyAlertDetails(emergencyAlertId);
    emergencyAlertData = emergencyAlertData.emergencyAlert;


    const currentStatusOfEmergencyAlert = emergencyAlertData.status;
    const currentRadiusOfEmergencyAlert = emergencyAlertData.radiusBeingSearched;


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

    // if (currentRadiusOfEmergencyAlert != null) {
    //     //Update the radius of the circle
    //     circle.setRadius(currentRadiusOfEmergencyAlert * 1000);

    //     //Update the pulse animation
    //     baseRadius = currentRadiusOfEmergencyAlert * 1000;
    //     maxRadius = (currentRadiusOfEmergencyAlert * 1000) + 10;
    //     minRadius = (currentRadiusOfEmergencyAlert * 1000) - 10;

    // }



    //Todo , check proximity from the get request we sent to update it





});
