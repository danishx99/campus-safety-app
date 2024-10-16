let adminBusy = false;

// Function to generate HTML for each emergency alert
function generateEmergencyAlertHTML(alert) {
  const location = JSON.parse(alert.location);
  const statusColor = getStatusColor(alert.status);
  const isSearching = alert.status.toLowerCase() === "searching";
  const isCancelled = alert.status.toLowerCase() === "cancelled";
  const isAssigned = alert.status.toLowerCase() === "assigned";
  const isResolved = alert.status.toLowerCase() === "resolved";
  const isAssignedToCurrentUser = alert.assignedToCurrentUser;
  

  return `
        <div id="alert-${alert._id}" class="mb-6">
        <div class="border border-black rounded-lg p-4 flex flex-col bg-white shadow-md">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div class="flex-grow min-w-0">
              <p class="font-bold truncate">
                ${alert.title || "No title provided"} 
              </p>
            </div>
            <div class="flex items-center mt-2 sm:mt-0">
              <a href='https://www.google.com/maps?q=${location.latitude},${
    location.longitude
  }' target='_blank' class="mr-2">
                <img src="../assets/locationPick.webp" alt="Location" class="h-5 w-5 mr-2 cursor-pointer locationPick">
              </a>
              <p class="bg-[#E3E5E9] rounded-full flex items-center justify-center font-bold ${statusColor} px-3 py-1 text-xs">
              ${
                isSearching
                  ? `<span class="searching-animation">Searching <span class="dot-animation"></span></span>`
                  : alert.status
              }
              </p>
            </div>
          </div>
          <p class="mt-2 text-sm">${
            alert.description || "No description provided"
          }</p>
            ${
              isSearching || isCancelled
                ? ""
                : ` <p class="mt-1 text-xs">Assigned to: ${ isAssignedToCurrentUser && isAssigned ? `<span class="text-blue-600 font-bold">You</span>` : alert.assignedTo }</p>`
            }
  
          <p class="mt-1 text-xs">Reported at: ${new Date(
            alert.createdAt
          ).toLocaleString()}</p>
            <p class="mt-1 text-xs">Reported by: ${alert.reportedBy}</p>
          <div class="mt-3 flex justify-end">
  
      
          ${
            isSearching && !adminBusy
              ? `<button 
              class="text-sm flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              data-alert-id="${alert._id}" id="acceptButton"
            >
            Accept
             <svg
          aria-hidden="true"
          class="w-3 h-3 mx-auto text-gray-200 animate-spin dark:text-gray-600 ml-2 fill-[#fbfbfb] hidden"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="loader-${alert._id}"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
            </button>`
              : ""
          }

          ${
                      isAssignedToCurrentUser && isAssigned
                        ? `<a href="/admin/emergencyalerts/track/${alert._id}"><button 
              class="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              data-alert-id="${alert._id}"
            >
            Track
            </button></a>`
                        : ""
                    }
  
          </div>
        </div>
      </div>
      `;
}

function addSearchingAnimation() {
  const style = document.createElement("style");
  style.textContent = `
      .searching-animation {
        display: inline-block;
      }
      .dot-animation::after {
        content: '...';
        display: inline-block;
        animation: ellipsis 1.5s infinite;
        width: 12px;
        text-align: left;
      }
      @keyframes ellipsis {
        0% { content: ''; }
        25% { content: '.'; }
        50% { content: '..'; }
        75% { content: '...'; }
        100% { content: ''; }
      }
    `;
  document.head.appendChild(style);
}


// Function to determine status color
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "searching":
      return "text-yellow-600 bg-yellow-100";
    case "assigned":
      return "text-blue-600 bg-blue-100";
    case "resolved":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

// Function to add the searching animation styles
function addSearchingAnimation() {
  const style = document.createElement("style");
  style.textContent = `
        .searching-animation {
          display: inline-block;
        }
        .dot-animation::after {
          content: '...';
          display: inline-block;
          animation: ellipsis 1.5s infinite;
          width: 12px;
          text-align: left;
        }
        @keyframes ellipsis {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
          100% { content: ''; }
        }
      `;
  document.head.appendChild(style);
}

let allEmergencyAlerts;

function filterEmergenciesByStatus() {
  // Get the selected statuses from the checkboxes
  const checkedStatuses = Array.from(
    document.querySelectorAll(".status-filter:checked")
  ).map((checkbox) => checkbox.value);

  return checkedStatuses;
}

function displayFilteredEmergencies() {
  let currentCheckedStatuses = filterEmergenciesByStatus();

  const alertsContainer = document.getElementById("allEmergencyAlerts");
  alertsContainer.innerHTML = ""; // Clear existing content

  let alertsToBeDisplayed = allEmergencyAlerts.filter((alert) =>
    currentCheckedStatuses.includes(alert.status)
  );

  alertsToBeDisplayed.forEach((alert) => {
    alertsContainer.innerHTML += generateEmergencyAlertHTML(alert);
  });
}

// Function to fetch and display emergency alerts
async function displayEmergencyAlerts() {
  const alertsContainer = document.getElementById("allEmergencyAlerts");
  const alertBox = document.getElementById("emergencyAlertBox");
  const mapLoader = document.getElementById("mapLoader");

  try {
    mapLoader.style.display = "block";
    alertsContainer.innerHTML = ""; // Clear existing content

    const response = await fetch("/emergency/getAllEmergencyAlerts");
    allEmergencyAlerts = await response.json();
    allEmergencyAlerts = allEmergencyAlerts.emergencies;

   

    //If any of the emergency alerts has isAssignedToCurrentUser as true, then update the global variable to true
    allEmergencyAlerts.forEach((alert) => {
      if (alert.assignedToCurrentUser) {
        adminBusy = true;
        return;
      }
    }
    );

    console.log(allEmergencyAlerts);

    // //Filtering to be done here
    // let currentCheckedStatuses = filterEmergenciesByStatus(); // ["Searching, Assigned, Resolved"]

    if (allEmergencyAlerts.length === 0) {
      alertsContainer.innerHTML =
        '<p class="text-center text-gray-500">No emergency alerts found.</p>';
    } else {
      displayFilteredEmergencies();
    }

    alertBox.style.display = "none";
  } catch (error) {
    console.error("Error fetching emergency alerts:", error);
    alertBox.textContent =
      "Error fetching emergency alerts. Please try again later.";
    alertBox.style.display = "block";
  } finally {
    mapLoader.style.display = "none";
  }
}

// Call the function to display emergency alerts when the page loads
document.addEventListener("DOMContentLoaded", () => {
  displayEmergencyAlerts();

  // Add event listeners to status checkboxes for filtering
  const statusFilters = document.querySelectorAll(".status-filter");
  statusFilters.forEach((checkbox) => {
    checkbox.addEventListener("change", displayFilteredEmergencies);
  });

  addSearchingAnimation();

  // Add event listener to the accept button
  document.addEventListener("click", async (event) => {
    if (event.target.id === "acceptButton") {
      const alertId = event.target.dataset.alertId;
      const loader = document.getElementById("loader-" + alertId);
      loader.classList.remove("hidden");

      try {
        const response = await fetch(`/emergency/acceptEmergencyAlert/${alertId}`);

        const data = await response.json();

        if (data.error) {
          console.log("Error accepting emergency alert:", data.error);
        } else {

          //Redirect to the track page
          window.location.href = `/admin/emergencyalerts/track/${alertId}`;
      
          // displayEmergencyAlerts();//refreshes dom after
        }
      } catch (error) {
        console.error("Error accepting emergency alert:", error);
       
      } finally {
        loader.classList.add("hidden");
      }
    }
  });

});
