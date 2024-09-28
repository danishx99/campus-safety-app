document.addEventListener("DOMContentLoaded", async () => {
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
                  alert.innerText = "Emergency alert sent successfully";
                  alert.style.color = 'green';
                  alert.style.backgroundColor = '#ddffdd';
                  alert.style.border = 'green';
                  // Redirect to panic page after success
                  window.location.href = "/user/emergencyAlerts";
              } else if(data.error === "Error sending emergency alert") {
                  alert.style.display = "block";
                  alert.innerText = "Error sending emergency alert";
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


/*document.getElementById('submitAlert').addEventListener('click', function (event) {
  console.log("submitAlert clicked");

    event.preventDefault();
    showpanicloader();

    // Collect the necessary data
    const title = document.getElementById('title').value;
    const message = document.getElementById('description').value;

    if(!title || !message){
        var alert = document.getElementById('alert');
        alert.classList.remove('hidden');
        alert.textContent = "Please fill in all fields";
        setTimeout(function(){
            alert.classList.add('hidden');
        }
        , 3000);
        hidepanicloader();
        return;
    }
    

    // Get the user's location (latitude and longitude)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Send a request to the server to send a panic alert
            fetch('/notifications/sendNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipient: 'admin', // You might need to adjust this based on your use case
                    message: message,
                    title: title,
                    notificationType: "emergency-alert",
                    senderLocation: [latitude, longitude] 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Notification sent successfully") {
                   var alert = document.getElementById('alert');
                     alert.classList.remove('hidden');
                    alert.textContent = "Emergency alert sent successfully";
                    // Redirect to panic page after success
                    window.location.href = "/user/emergencyAlerts";
                    setTimeout(function(){
                        alert.classList.add('hidden');
                    }
                    , 3000);
                } else {
                    var alert = document.getElementById('alert');
                     alert.classList.remove('hidden');
                    alert.textContent = "An error occurred while sending the panic alert.";
                    setTimeout(function(){
                        alert.classList.add('hidden');
                    }
                    , 3000);
                }
                hidepanicloader();
                closeToastBtn.style.display = 'inline-block';
            })
            .catch(error => {
                console.error('Error:', error);
                var alert = document.getElementById('alert');
                alert.classList.remove('hidden');
                alert.textContent = "An error occurred while sending the panic alert.";
                setTimeout(function(){
                    alert.classList.add('hidden');
                }
                , 3000);

                hidepanicloader();
            });
        }, function(error) {
            console.error('Geolocation error:', error);
            var alert = document.getElementById('alert');
            alert.classList.remove('hidden');
            alert.textContent = "An error occurred while sending the panic alert.";
            setTimeout(function(){
                alert.classList.add('hidden');
            }
            , 3000);

            hidepanicloader();
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
       
        var alert = document.getElementById('alert');
        alert.classList.remove('hidden');
        alert.textContent = "An error occurred while sending the panic alert.";
        setTimeout(function(){
            alert.classList.add('hidden');
        }
        , 3000);

        hidepanicloader();
    }
});*/




/*Modal */

});
