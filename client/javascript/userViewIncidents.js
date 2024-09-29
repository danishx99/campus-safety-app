document.addEventListener("DOMContentLoaded", () => {
  // Ensure default checkboxes are checked
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

    const response = await fetch("/incidentReporting/getIncidentByUser");
    const data = await response.json();
    const incidents = data.incidents;

    console.log(incidents);

    if (response.status !== 200) {
      errorMessage.innerText =
        "An internal server error occurred while fetching incidents";
      errorMessage.classList.add("block");
      return;
    }

    // Clear existing content
    incidentsContainer.innerHTML = "";

    // Check if there are no incidents
    if (incidents.length === 0) {
      errorMessage.innerText = "No incidents reported yet";
      errorMessage.classList.add("block");
      return;
    }

    // Display incidents based on the currently checked statuses
    incidents
      .filter((incident) => checkedStatuses.includes(incident.status))
      .forEach((incident, index) => {
        addIncidentToDOM(incident, index);
      });

    // Add event listeners to location images
    document.querySelectorAll(".locationPick").forEach((img) => {
      img.addEventListener("click", (event) => {
        const lat = event.target.getAttribute("data-lat");
        const lng = event.target.getAttribute("data-lng");
        if (lat && lng) {
          window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
        }
      });
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    errorMessage.innerText = "An error occurred while fetching incidents";
    errorMessage.classList.add("block");
  } finally {
    loader.style.display = "none";
    incidentsContainer.style.display = "block";
  }
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
  } else if (incident.status === "Complete") {
    statusColor = "text-green-500"; // Green for "Complete"
  }

  incidentDiv.innerHTML = `
  <div id="incident-${index}" class="mb-6">
    <div class="border border-black rounded-lg p-2 flex flex-col bg-white">
      <div class="flex justify-between">
        <div class="flex items-center text-sm">
          ${
            incident.userDetails.profilePicture
              ? `<img src="${incident.userDetails.profilePicture}" class="mr-2 h-5 w-5 rounded-full" alt="Profile">`
              : `<img src="../assets/user-profile.png" class="mr-2 h-5 w-5 rounded-full" alt="Profile">`
          }
          <p> 
            <span class="font-bold">
              ${
                incident.userDetails.firstName +
                " " +
                incident.userDetails.lastName
              }
            </span> reported an incident:
            <span class="font-bold">${incident.title}</span>
            (${incident.date})
          </p>
          <img src="../assets/locationPick.png" alt="" height="20" width="20"
            class="mx-2 cursor-pointer locationPick" data-lat="${latitude}" data-lng="${longitude}">
          ${
            incident.imageTrue
              ? `<a href='/incidentReporting/getIncidentImage/${incident._id}' target='_blank' class="mr-2"><img src="../assets/image.png" alt="Image" class="h-5 w-5 cursor-pointer show-image"></a>`
              : ""
          }
        </div>
        <p class="bg-[#E3E5E9] rounded-full flex items-center justify-center font-bold ${statusColor} w-40 max-w-40">
          ${incident.status}
        </p>
      </div>
      <p class="mt-1 text-sm">${incident.description}</p>
    </div>
  </div>
`;

  incidentsContainer.appendChild(incidentDiv);
}

// Filter incidents based on selected statuses
function filterIncidentsByStatus() {
  fetchAndDisplayIncidents().catch((error) =>
    console.error("Error filtering incidents:", error)
  );
}
