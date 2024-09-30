document.addEventListener("DOMContentLoaded", () => {
  // Ensure default checkboxes are checked (e.g., Pending and In Progress)
  document.querySelectorAll(".status-filter").forEach((checkbox) => {
    if (checkbox.value === "Pending" || checkbox.value === "In Progress") {
      checkbox.checked = true;
    }
  });

  // Fetch and display incidents based on the initial status filters
  fetchAndDisplayIncidents();

  // Add event listeners to status checkboxes for filtering
  const statusFilters = document.querySelectorAll(".status-filter");
  statusFilters.forEach((checkbox) => {
    checkbox.addEventListener("change", filterIncidentsByStatus);
  });
});

let fetchedIncidents; // Holds all incidents

// Fetch and display incidents from the server
async function fetchAndDisplayIncidents() {
  const errorMessage = document.getElementById("pageAlert");
  const loader = document.getElementById("loader");
  const incidentsContainer = document.getElementById("allIncidents");

  // Get the currently checked statuses
  const checkedStatuses = Array.from(
    document.querySelectorAll(".status-filter:checked")
  ).map((checkbox) => checkbox.value);

  // Hide error message
  errorMessage.classList.remove("block");

  try {
    // Show loader and hide incidents container
    loader.style.display = "block";
    incidentsContainer.style.display = "none";

    // Fetch incidents from the server
    const response = await fetch("/incidentReporting/getIncidentByUser");
    const data = await response.json();
    const incidents = data.incidents;

    // Cache the incidents in the fetchedIncidents variable
    fetchedIncidents = incidents;

    // Check for errors in the response
    if (response.status !== 200) {
      errorMessage.innerText =
        "An internal server error occurred while fetching incidents";
      errorMessage.classList.add("block");
      return;
    }

    // Check if no incidents exist
    if (incidents.length === 0) {
      errorMessage.innerText = "No incidents reported yet";
      errorMessage.classList.add("block");
      return;
    }

    // Filter and display incidents based on the currently checked statuses
    displayFilteredIncidents(checkedStatuses);

    // // Add event listeners to location images for Google Maps links
    // document.querySelectorAll(".locationPick").forEach((img) => {
    //   img.addEventListener("click", (event) => {
    //     const lat = event.target.getAttribute("data-lat");
    //     const lng = event.target.getAttribute("data-lng");
    //     if (lat && lng) {
    //       window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    //     }
    //   });
    // });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    errorMessage.innerText = "An error occurred while fetching incidents";
    errorMessage.classList.add("block");
  } finally {
    // Hide loader and show the incidents container
    loader.style.display = "none";
    incidentsContainer.style.display = "block";
  }
}

// Filter incidents and display them in the DOM
function filterIncidentsByStatus() {
  // Get the selected statuses from the checkboxes
  const checkedStatuses = Array.from(
    document.querySelectorAll(".status-filter:checked")
  ).map((checkbox) => checkbox.value);

  // Filter and display incidents based on the selected statuses
  displayFilteredIncidents(checkedStatuses);
}

// Display incidents based on the filtered statuses
function displayFilteredIncidents(checkedStatuses) {
  const incidentsContainer = document.getElementById("allIncidents");
  incidentsContainer.innerHTML = ""; // Clear existing content

  // Filter the cached incidents and display them in the DOM
  fetchedIncidents
    .filter((incident) => checkedStatuses.includes(incident.status))
    .forEach((incident, index) => {
      addIncidentToDOM(incident, index);
    });
}

// Add incidents to DOM
function addIncidentToDOM(incident, index) {
  const incidentsContainer = document.getElementById("allIncidents");

  const [latitude, longitude] = incident.location
    .split(", ")
    .map((coord) => parseFloat(coord));

  const date = new Date(incident.date);
  incident.date = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

  const incidentDiv = document.createElement("div");
  incidentDiv.className = "mb-6";

  // Determine the style for the status based on the incident's status
  let statusColor = "";
  if (incident.status === "Pending") {
    statusColor = "text-red-500"; // red for "Pending"
  } else if (incident.status === "In Progress") {
    statusColor = "text-orange-500"; // Orange for "In Progress"
  } else if (incident.status === "Resolved") {
    statusColor = "text-green-500"; // Green for "Complete"
  }

  incidentDiv.innerHTML = `
  <div id="incident-${index}" class="mb-6">
  <div class="border border-black rounded-lg p-4 flex flex-col bg-white shadow-md">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div class="flex items-center text-sm w-full sm:w-auto mb-2 sm:mb-0">
        <img src="${incident.userDetails.profilePicture ? incident.userDetails.profilePicture : '../assets/user-profile.png'}" 
             class="mr-2 h-8 w-8 rounded-full flex-shrink-0" alt="Profile">
        <div class="flex-grow min-w-0">
          <p class="font-bold truncate">
            ${incident.userDetails.firstName} ${incident.userDetails.lastName}
          </p>
          <p class="truncate">
            Reported: <span class="font-bold">${incident.title}</span>
          </p>
          <p class="text-xs text-gray-500">${incident.date}</p>
        </div>
      </div>
      <div class="flex items-center mt-2 sm:mt-0">
       ${
          incident.location
            ? `<a href='https://www.google.com/maps?q=${latitude},${longitude}' target='_blank' class="mr-2"><img src="../assets/locationPick.png" alt="Location" class="h-5 w-5 mr-2 cursor-pointer locationPick" data-lat="${latitude}" data-lng="${longitude}"></a>`
            : ""
        }
        ${incident.imageTrue ? `<a href='/incidentReporting/getIncidentImage/${incident._id}' target='_blank' class="mr-2"><img src="../assets/image.png" alt="Image" class="h-5 w-5 cursor-pointer show-image"></a>` : ""}
        <p class="bg-[#E3E5E9] rounded-full flex items-center justify-center font-bold ${statusColor} px-3 py-1 text-xs">
          ${incident.status}
        </p>
      </div>
    </div>
    <p class="mt-2 text-sm">${incident.description}</p>
  </div>
</div>
`;

  incidentsContainer.appendChild(incidentDiv);
}
