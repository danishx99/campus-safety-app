
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// import {
//   getMessaging,
//   onMessage,
// } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
//   authDomain: "campus-safety-fcm.firebaseapp.com",
//   projectId: "campus-safety-fcm",
//   storageBucket: "campus-safety-fcm.appspot.com",
//   messagingSenderId: "221773083535",
//   appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
//   measurementId: "G-8BZHJT3BRY",
// };


// function intializeFirebaseForUpdates() {

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//   const messaging = getMessaging(app);


 

//   // Handle incoming messages when the app is in the foreground
//   onMessage(messaging, (payload) => {
//       console.log("Message received as part of redirect listener: ", payload);

//       // Access status data
//       const emergencyAlertIdPayload = payload.data.emergencyAlertId;
//       const redirect = payload.data.redirect;

//       if(redirect){
//         window.location.href = `/user/emergencyalerts/track/${emergencyAlertIdPayload}`;
//       }

//   });
// }

document.addEventListener("DOMContentLoaded", async () => {

  // intializeFirebaseForUpdates();

  // Function to show the loader
  function showloader() {
    document.getElementById("loader").classList.remove("hidden");
  }

  /* Load the user's profile picture */
  const headerProfilePic = document.getElementById("headerProfilePic");
  const savedProfilePicture = localStorage.getItem("userProfilePicture");

  if (savedProfilePicture) {
    headerProfilePic.src = savedProfilePicture;
  }

  try {
    const response = await fetch("/profile/getCurrentUser", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();

    if (data.user && data.user.profilePicture) {
      headerProfilePic.src = data.user.profilePicture;

      console.log("I found a profile picture", data.user.profilePicture);
      localStorage.setItem("userProfilePicture", data.user.profilePicture);
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
  /*Load the users profile picture */

  /* Notification dropdown */

  const notificationButton = document.getElementById("notificationButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const notificationList = document.getElementById("notificationList");
  const notificationBadge = document.getElementById("notificationBadge");

  let totalUnreadNotifications = 0;

  // Fetch notifications(limited to 5)
  fetch("/notifications/getUnreadNotifications")
    .then((response) => response.json())
    .then((data) => {
      const notifications = data.notifications;
      totalUnreadNotifications = notifications.length; // Get the total number of unread notifications
      // alert(totalUnreadNotifications)
      updateNotifications(notifications);
      updateBadge(totalUnreadNotifications);
    })
    .catch((error) => {
      console.error("Error fetching notifications:", error);
    });

  function updateNotifications(notifications) {
    notificationList.innerHTML = "";

    if (notifications.length > 0) {
      notifications.forEach((notification) => {
        const div = document.createElement("div");
        div.className = "px-4 py-2"; 
        div.style.color = "black"; 

        // Title
        const title = document.createElement("div");
        title.className = "text-navy-800 font-semibold";
        title.textContent = notification.title;

        // Message
        const message = document.createElement("div");
        message.className = "text-gray-600 text-sm truncate";
        message.textContent = notification.message;

        div.appendChild(title);
        div.appendChild(message);
        notificationList.appendChild(div);
      });

      // "See all notifications" button(dont know why i name it clearButton and i was too lazy to change it)
      const clearButton = document.createElement("button");
      clearButton.className = "w-full text-left px-4 py-2 text-sm text-red-600";
      clearButton.innerHTML = "<a href='/notifications/redirectToNotificationPage'>See all notifications</a>";
      notificationList.appendChild(clearButton);

    } else {
      // No notifications case
      const noNotifDiv = document.createElement("div");
      noNotifDiv.className = "px-4 py-2 text-gray-500 bg-blue-50";
      noNotifDiv.textContent = "No new notifications";
      notificationList.appendChild(noNotifDiv);

      const clearButton = document.createElement("button");
      clearButton.className = "w-full text-left px-4 py-2 text-sm text-red-600";
      clearButton.innerHTML = "<a href='/notifications/redirectToNotificationPage'>See all notifications</a>";
      notificationList.appendChild(clearButton);
    }
  }

  function updateBadge(count) {
    notificationBadge.textContent = count;
    // notificationBadge.classList.toggle("hidden", count === 0); // Hide badge if no unread notifications
  }


  notificationButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  // Close the dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !notificationButton.contains(event.target) &&
      !dropdownMenu.contains(event.target)
    ) {
      dropdownMenu.classList.add("hidden");
    }
  });

  /* Notification dropdown */

  /*Panic Button */

  const panicButton = document.getElementById('panicButton');
  const panicModal = document.getElementById('panicModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  if (panicButton && panicModal && closeModalBtn) {
      panicButton.addEventListener('click', function() {
          panicModal.classList.remove('hidden');
      });
      closeModalBtn.addEventListener('click', function() {
          panicModal.classList.add('hidden');
      });
  }


function showpanicloader(){
  document.getElementById('submitLoader').classList.remove('hidden');
}

function hidepanicloader(){
  document.getElementById('submitLoader').classList.add('hidden');
}

const submitAlert = document.getElementById('submitAlert');

if(submitAlert){
submitAlert.addEventListener('click', function (event) {
  event.preventDefault();

  showpanicloader();

  var alert = document.getElementById('alert');
 
  //alert.style.display = "block";
  //alert.innerText = "An unexpected error occurred. Please try again.";
  
  // Get the user's live location
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
          const userLocation = {
              latitude: position.coords.latitude, 
              longitude: position.coords.longitude
          };

          // Construct the data to send
          const alertData = {
              title: document.getElementById('title').value || "",
              description: document.getElementById('description').value || "",
              location: JSON.stringify(userLocation)
          };

          // Send POST request with the alert data
          fetch('/emergency/sendPanic', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(alertData)
          })
          .then(response => response.json())
          .then(data => {
              console.log(data);
              if (data.message === "Emergency alert sent successfully") {
                  alert.style.display = "block";
                  alert.innerText = "Emergency alert sent successfully. Redirecting in a moment...";
                  alert.style.color = 'green';
                  alert.style.backgroundColor = '#ddffdd';
                  alert.style.border = 'green';

                  //Start the notify admins by proximity function(This will run in the background, but once it starts,
                  //we will be redirected because an FCM notificaiton will be sent)
                fetch('/emergency/notifyAdminsByProximity', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ emergencyAlertId: data.emergencyAlertId, location: JSON.stringify(userLocation)})
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                })
                .catch((error) => {
                    console.log('Function to notify admins by proximity failed:', error);
                });

                 
                   
              } else if(data.error) {
                  alert.style.display = "block";
                  alert.innerText = data.error;
              }

              hidepanicloader();
          })
          .catch((error) => {
              console.error('Error:', error);
              alert.style.display = "block";
              alert.innerText = "Error"+error;
              hidepanicloader();
              
          });

      }, function (error) {
          console.error("Error fetching location:", error);
          alert.style.display = "block";
          alert.innerText = "Unable to retrieve your location.";
          hidepanicloader();
      });
  } else {
      alert.style.display = "block";
      alert.innerText = "Geolocation is not supported by your browser.";
      hidepanicloader();
  }
});

}


// Optional: Close the modal when clicking outside of the modal content
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('panicModal')) {
        document.getElementById('panicModal').classList.add('hidden');
    }
});


function UpdateUserLocation(latitude, longitude){

  // Send the location to the server
  fetch('/location/update', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude })
  })
  .then(response =>{

    if(response.status == 200){
      console.log("Status code 200 received");
    }else{
      console.log("Error updating location, server responded not okay! ", response.status);
    }

    return response.json();

  } )
  .then(data => {
      console.log(data.message);
  })
  .catch((error) => {
      console.error('Error sending location details from Geolocation API to server:', error);
  });

}

// Function to get the current location
function getCurrentLocation() {
  console.log("2 seconds have passed")
  // Check if the Geolocation API is available
  if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const currentLatitude = position.coords.latitude;
              const currentLongitude = position.coords.longitude;

              console.log('Latitude:', currentLatitude);
              console.log('Longitude:', currentLongitude);
              console.log('Accuracy (meters):', position.coords.accuracy);

              // Update the user location on the server
              UpdateUserLocation(currentLatitude, currentLongitude);
          },
          (error) => {
              console.log("Error getting location:", error);
          },
          {
              enableHighAccuracy: true, // Get more accurate readings (uses more battery)
              timeout: 10000,           // Wait up to 10 seconds for a location
              maximumAge: 0             // Don't use cached position data
          }
      );
  } else {
      console.log("Geolocation is not available in this browser.");
  }
}


// Call getCurrentLocation every 2 seconds
setInterval(getCurrentLocation, 2000);
// Global variable to hold the geocoder
// let geocoder;

// // Function to load the Google Maps API script
// function loadGoogleMapsScript() {
//   const script = document.createElement('script');
//   script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAmnz9yP1MewDeyOE-OV92JrAclq18JzZ4&libraries=places,geometry&callback=initGoogleMaps';
//   script.async = true;
//   script.defer = true;
//   document.head.appendChild(script);
// }

// // Initialize Google Maps services
// function initGoogleMaps() {
//   geocoder = new google.maps.Geocoder();
  
//   // Start getting location every 2 seconds
//   setInterval(getUserLocation, 2000);
// }

// // Function to get the user's location and address
// function getUserLocation() {
//   console.log("10 seconds have passed");
  
//   const locationRequest = {
//     enableHighAccuracy: true,
//     timeout: 5000,
//     maximumAge: 0
//   };

//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;
        
//         console.log('Latitude:', latitude);
//         console.log('Longitude:', longitude);
//         console.log('Accuracy (meters):', position.coords.accuracy);
        
//         // Use Google Maps Geocoder to get address
//         const latlng = new google.maps.LatLng(latitude, longitude);
        
//         geocoder.geocode({ 'location': latlng }, (results, status) => {
//           if (status === 'OK') {
//             if (results[0]) {
//               console.log('Formatted Address:', results[0].formatted_address);
              
//               // Log detailed address components
//               const addressComponents = results[0].address_components;
//               for (let component of addressComponents) {
//                 console.log(component.types[0] + ': ' + component.long_name);
//               }
              
//               // Update the user location on the server
//               // UpdateUserLocation(latitude, longitude, results[0].formatted_address);
//             }
//           } else {
//             console.log('Geocoder failed due to: ' + status);
//           }
//         });
//       },
//       (error) => {
//         console.log("Error getting location:", error);
//       },
//       locationRequest
//     );
//   } else {
//     console.log("Geolocation is not supported by this browser.");
//   }
// }

// // Call this function to load the Google Maps script and start the location tracking
// loadGoogleMapsScript();

// // Make sure initGoogleMaps is available globally
// window.initGoogleMaps = initGoogleMaps;
});
