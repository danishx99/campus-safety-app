// Function to generate HTML for each emergency alert
function generateEmergencyAlertHTML(alert) {
  const location = JSON.parse(alert.location);
  const statusColor = getStatusColor(alert.status);
  
  const isSearching = alert.status.toLowerCase() === "searching";
  const isCancelled = alert.status.toLowerCase() === "cancelled";
  const isResolved = alert.status.toLowerCase() === "resolved";

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
              <img src="../assets/locationPick.png" alt="Location" class="h-5 w-5 mr-2 cursor-pointer locationPick">
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
              : ` <p class="mt-1 text-xs">Assigned to: ${alert.assignedTo}</p>`
          }

        <p class="mt-1 text-xs">Reported at: ${new Date(
          alert.createdAt
        ).toLocaleString()}</p>
        <div class="mt-3 flex justify-end">

        ${
          isCancelled || isResolved
            ? ""
            : `     <a href="/user/emergencyalerts/track/${alert._id}"><button 
            class="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            data-alert-id="${alert._id}"
          >
            Track
          </button></a>`
        }


        </div>
      </div>
    </div>
    `;
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

let alerts;

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

  let alertsToBeDisplayed = alerts.filter((alert) =>
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

    const response = await fetch("/emergency/getEmergencyAlertsByUser");
    alerts = await response.json();
    alerts = alerts.emergencies;

    if (alerts.length === 0) {
      alertsContainer.innerHTML =
        '<p class="text-center text-gray-500">No emergency alerts found.</p>';
    } else {
      // alerts.forEach((alert) => {
      //   alertsContainer.innerHTML += generateEmergencyAlertHTML(alert);
      // });
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
});
