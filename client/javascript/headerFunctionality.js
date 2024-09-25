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

  let notifications = [];
  let totalUnreadNotifications = 0; // To track the total number of unread notifications

  // Fetch unread notifications
  fetch("/notifications/getUnreadNotifications")
    .then((response) => response.json())
    .then((data) => {
      notifications = data.notifications;
      totalUnreadNotifications = notifications.length; // Store the total number of unread notifications

      // Limit the displayed notifications to 5
      notifications = notifications.slice(0, 5);
      updateNotifications();
    })
    .catch((error) => {
      console.log("Error fetching notifications:", error);
    });

  function updateNotifications() {
    notificationList.innerHTML = "";

    if (notifications.length > 0) {
      notifications.forEach((notification) => {
        const div = document.createElement("div");
        div.className = "px-4 py-2"; // Add background and hover effect
        div.style.color = "black"; // Set text color to ensure visibility

        // Create a title element
        const title = document.createElement("div");
        title.className = "text-navy-800 font-semibold"; // Dark navy blue color and bold font
        title.textContent = notification.title;

        // Create a message element
        const message = document.createElement("div");
        message.className = "text-gray-600 text-sm truncate"; // Gray color and small text with truncation
        message.textContent = notification.message;

        // Append title and message to the main div
        div.appendChild(title);
        div.appendChild(message);

        // Append the main div to the notification list
        notificationList.appendChild(div);
      });

      // Add a "See all notifications" button
      const clearButton = document.createElement("button");
      clearButton.className =
        "w-full text-left px-4 py-2 text-sm text-red-600 "; // Blue background for the button too
      clearButton.innerHTML = "<a href='/notifications/redirectToNotificationPage'>See all notifications</a>";
      
      notificationList.appendChild(clearButton);

      // Update the notification badge with the total number of unread notifications (not the sliced number)
      notificationBadge.textContent = totalUnreadNotifications;
      notificationBadge.classList.remove("hidden");
    } else {
      // If no notifications, display a "No notifications" message
      const div = document.createElement("div");
      div.className = "px-4 py-2 text-gray-500 bg-blue-50"; // Slight blue background
      div.textContent = "No new notifications";
      notificationList.appendChild(div);

      // Add a "See all notifications" button
      const clearButton = document.createElement("button");
      clearButton.className =
        "w-full text-left px-4 py-2 text-sm text-red-600 "; // Blue background for the button too
      clearButton.textContent = "See all notifications";
      clearButton.innerHTML =
        "<a href='/notifications/redirectToNotificationPage'>See all notifications</a>";
      notificationList.appendChild(clearButton);

      // Update the notification badge to 0 since there are no notifications
      notificationBadge.textContent = totalUnreadNotifications;
      notificationBadge.classList.remove("hidden");
    }
  }

  function clearNotifications() {
    // Send a request to mark all notifications as read
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


  /*Modal */

document.getElementById('panicButton').addEventListener('click', function() {
    document.getElementById('panicModal').classList.remove('hidden');
});

document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('panicModal').classList.add('hidden');
});

document.getElementById('submitAlert').addEventListener('click', function() {
    //redirect to panic page  
    window.location.href = "/user/emergencyAlerts";
});

// Optional: Close the modal when clicking outside of the modal content
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('panicModal')) {
        document.getElementById('panicModal').classList.add('hidden');
    }
});


function showpanicloader(){
    document.getElementById('submitLoader').classList.remove('hidden');
}

function hidepanicloader(){
    document.getElementById('submitLoader').classList.add('hidden');
}
document.getElementById('submitAlert').addEventListener('click', function(event) {

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
});




/*Modal */

});
