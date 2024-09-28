document.addEventListener("DOMContentLoaded", () => {
  // Ensure default checkboxes are checked
  document.querySelectorAll(".status-filter").forEach((checkbox) => {
    if (checkbox.value === "Pending" || checkbox.value === "In Progress") {
      checkbox.checked = true;
    }
  });

  // Fetch and display incidents based on the initial status filters
  fetchAndDisplayIncidents();

  // Add event listeners to status checkboxes
  const statusFilters = document.querySelectorAll(".status-filter");
  statusFilters.forEach((checkbox) => {
    checkbox.addEventListener("change", filterIncidentsByStatus);
  });

  // Other event listeners for buttons and images
  const saveButton = document.getElementById("save");
  saveButton.addEventListener("click", updateIncidentsStatus);


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

    const response = await fetch("/incidentReporting/getIncidents");

    // Ensure the response is JSON and not HTML or other content
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server did not return valid JSON");
    }

    const data = await response.json(); // Parse the JSON

    if (response.status !== 200) {
      errorMessage.innerText =
        "An internal server error occurred while fetching incidents";
      errorMessage.classList.add("block");
      return;
    }

    const incidents = data.incidents;

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

  // format the date of this format (2024-09-26T21:17)
  const date = new Date(incident.date);
  incident.date = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

  const options = ["Pending", "In Progress", "Resolved"];
  const optionsHTML = options
    .map(
      (option) =>
        `<option value="${option}" ${
          incident.status === option ? "selected" : ""
        }>${option}</option>`
    )
    .join("");

  const incidentDiv = document.createElement("div");
  incidentDiv.className = "mb-6";

  incidentDiv.innerHTML = `
    <div id="incident-${index}" class="mb-6">
      <div class="border border-black rounded-lg p-2 flex flex-col bg-white">
        <div class="flex justify-between">
          <div class="flex items-center max-sm:text-xs text-sm">
            <img src="../assets/profileIcon.png" class="mr-2" alt="">
            <p class="max-sm:text-xs"> 
              <span class="font-bold ">
                ${incident.firstName + " " + incident.lastName}
              </span> reported an incident:
              <span class="font-bold">${incident.title}</span>
              (${incident.date})
            </p>
            <img src="../assets/locationPick.png" alt="" height="20" width="20" class="mx-2 cursor-pointer locationPick max-sm:h-4 max-sm:w-4" data-lat="${latitude}" data-lng="${longitude}">
            ${
              incident.image
                ? `<a href='/incidentReporting/getIncidentImage/${incident._id}' target='_blank'><img src="../assets/image.png" alt="" height="20" width="20" class="mx-2 cursor-pointer show-image max-sm:h-4 max-sm:w-4"></a>`
                : ""
            }
          </div>
          <select class="status-select bg-gray-300 rounded-lg px-4 max-sm:text-xs max-sm:px-1 max-h-8 text-sm"
            data-incident-id="${incident._id}">
            ${optionsHTML}
          </select>
        </div>
        <p class="mt-1 text-sm max-sm:text-xs">${incident.description}</p>
      </div>
      <div class="flex mt-3 text-sm">
        <button class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mx-3 max-sm:px-2">
          Send notification to <span>${incident.firstName}</span>
        </button>
        <button class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mr-3 max-sm:px-2">
          Send announcement to all users
        </button>
      </div>
    </div>
  `;
  incidentsContainer.appendChild(incidentDiv);
}

// Filter incidents based on selected statuses
function filterIncidentsByStatus() {
  const checkedStatuses = Array.from(
    document.querySelectorAll(".status-filter:checked")
  ).map((checkbox) => checkbox.value);

  fetchAndDisplayIncidents()
    .then(() => {
      const incidentDivs = document.querySelectorAll("[id^=incident-]");
      incidentDivs.forEach((div) => {
        const selectElement = div.querySelector(".status-select");
        if (!checkedStatuses.includes(selectElement.value)) {
          div.style.display = "none";
        } else {
          div.style.display = "block";
        }
      });
    })
    .catch((error) => console.error("Error filtering incidents:", error));
}

// Update incidents' statuses and re-filter based on current filters
async function updateIncidentsStatus() {
  const saveButton = document.getElementById("save");
  const saveLoader = document.getElementById("saveLoader");
  const message = document.getElementById("alert");

  saveLoader.classList.remove("hidden");
  saveButton.disabled = true;

  const selectElements = document.querySelectorAll(".status-select");
  const updatedStatuses = Array.from(selectElements).map((select) => ({
    incidentId: select.getAttribute("data-incident-id"),
    status: select.value,
  }));

  try {
    const response = await fetch("/incidentReporting/updateIncident", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ incidents: updatedStatuses }),
    });

    if (response.ok) {
      // Re-fetch and filter incidents after status update
      await fetchAndDisplayIncidents();

      message.innerText = "Incident statuses updated successfully";
      message.classList.add(
        "block",
        "bg-green-100",
        "text-green-500",
        "border-green-300"
      );
      // Hide message after a delay
      setTimeout(() => {
        message.classList.remove(
          "block",
          "bg-green-100",
          "text-green-500",
          "border-green-300"
        );
      }, 2000);
    } else {
      message.innerText = "An error occurred while updating incident statuses";
      message.classList.add(
        "block",
        "bg-red-100",
        "text-red-500",
        "border-red-300"
      );
      // Hide message after a delay
      setTimeout(() => {
        message.classList.remove(
          "block",
          "bg-red-100",
          "text-red-500",
          "border-red-300"
        );
      }, 2000);
    }
  } catch (error) {
    console.error("Error updating statuses:", error);
    message.innerText = "An error occurred while updating statuses";
    message.classList.add(
      "block",
      "bg-red-100",
      "text-red-500",
      "border-red-300"
    );
    // Hide message after a delay
    setTimeout(() => {
      message.classList.remove(
        "block",
        "bg-red-100",
        "text-red-500",
        "border-red-300"
      );
    }, 2000);
  } finally {
    saveLoader.classList.add("hidden");
    saveButton.disabled = false;
  }
}
