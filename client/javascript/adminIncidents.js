document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayIncidents();

  // Attach event listener to the Save button
  const saveButton = document.getElementById("save");
  saveButton.addEventListener("click", updateIncidentsStatus);
});

async function fetchAndDisplayIncidents() {
  const errorMessage = document.getElementById("alert");
  const loader = document.getElementById("loader");
  const incidentsContainer = document.getElementById("allIncidents");

  // Hide error message
  errorMessage.classList.remove("block");

  try {
    // Show loader and hide incidents container
    loader.style.display = "block";
    incidentsContainer.style.display = "none";

    const response = await fetch(
      "http://localhost:3000/incidentReporting/getIncidents"
    );

    const data = await response.json();
    console.log(data);
    const incidents = data.incidents;

    if (response.status !== 200) {
      errorMessage.innerText =
        "An internal server error occurred while fetching incidents";
      errorMessage.classList.add("block");
      return;
    }

    // Clear existing content
    incidentsContainer.innerHTML = "";

    incidents.forEach((incident, index) => {
      // Create the incident card
      const incidentDiv = document.createElement("div");
      incidentDiv.className = "mb-6";

      // Extract latitude and longitude from location
      const [latitude, longitude] = incident.location
        .split(", ")
        .map((coord) => parseFloat(coord));

      // Define the available options
      const options = ["Pending", "In Progress", "Resolved"];

      // Create options HTML
      const optionsHTML = options
        .map(
          (option) =>
            `<option value="${option}" ${
              incident.status === option ? "selected" : ""
            }>${option}</option>`
        )
        .join("");

      incidentDiv.innerHTML = `
                <div id="incident-${index}" class="mb-6">
                        <div class="border border-black rounded-lg p-2 flex flex-col bg-white">
                            <div class="flex justify-between">
                                <div class="flex items-center max-sm:text-xs text-sm">
                                    <img src="../assets/profileIcon.png" class="mr-2" alt="">
                                    <p class="max-sm:text-xs"> <span class="font-bold ">${
                                      incident.firstName +
                                      " " +
                                      incident.lastName
                                    }</span> reported an
                                        incident:
                                        <span class="font-bold">
                                            ${incident.title}
                                        </span>
                                        (${incident.date})
                                    </p>
                                    <img src="../assets/locationPick.png" alt="" height="20" width="20"
                                        class="mx-2 cursor-pointer locationPick" data-lat="${latitude}" data-lng="${longitude}">
                                </div>
                                <select class="status-select bg-gray-300 rounded-lg px-4 max-sm:text-xs max-sm:px-1 max-h-8 text-sm"
                                    data-incident-id="${incident._id}">
                                    ${optionsHTML}
                                </select>
                            </div>
                            <p class="mt-1 text-sm max-sm:text-xs">${
                              incident.description
                            }</p>
                        </div>
                        <div class="flex mt-3 text-sm">
                            <button
                                class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mx-3 max-sm:px-2">Send
                                notification to <span>${
                                  incident.firstName
                                }</span></button>
                            <button
                                class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mr-3 max-sm:px-2">Send
                                announcement to all users </button>
                        </div>
                    </div>
            `;

      incidentsContainer.appendChild(incidentDiv);
    });

    // Add event listeners to location images after content is added
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
    // Show error message if fetching fails
    errorMessage.innerText = "An error occurred while fetching incidents";
    errorMessage.classList.add("block");
  } finally {
    // Hide loader and show incidents container after fetching
    loader.style.display = "none";
    incidentsContainer.style.display = "block";
  }
}

async function updateIncidentsStatus() {
  const saveButton = document.getElementById("save");
  const saveLoader = document.getElementById("saveLoader");
  const message = document.getElementById("alert");

  // Show the loader and disable the button
  saveLoader.classList.remove("hidden");
  saveButton.disabled = true;

  const selectElements = document.querySelectorAll(".status-select");

  const updatedStatuses = Array.from(selectElements).map((select) => ({
    incidentId: select.getAttribute("data-incident-id"),
    status: select.value,
  }));

  console.log(updatedStatuses);

  try {
    const response = await fetch(
      "http://localhost:3000/incidentReporting/updateIncident",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidents: updatedStatuses }),
      }
    );

    if (response.ok) {
      console.log("Statuses updated successfully!");
      //show alert message and make it green
      message.innerText = "Incident statuses updated successfully";
      message.classList.add("block");
      message.classList.add("bg-green-100");
      message.classList.add("text-green-500");
      message.classList.add("border-green-300");
      setTimeout(() => {
        message.classList.remove("block");
        message.classList.remove("bg-green-300");
        message.classList.remove("text-green-800");
        message.classList.remove("border-green-400");
      }, 2000);
    } else {
      console.error("Failed to update statuses");
      // You can add an error message or visual feedback here
      //show alert message
      message.innerText = "An error occurred while updating incident statuses";
      message.classList.add("block");
      //hide after 2 seconds
      setTimeout(() => {
        message.classList.remove("block");
      }, 2000);
    }
  } catch (error) {
    console.error("Error updating statuses:", error);
  } finally {
    // Hide the loader and re-enable the button
    saveLoader.classList.add("hidden");
    saveButton.disabled = false;
  }
}
