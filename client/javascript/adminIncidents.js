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

  //Button for closing the modal
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", function () {
      hideModal();
    });

  //Add event listener to the submit button(send notification form)
  const submitIncidentUpdate = document.getElementById("submitIncidentUpdate");
  submitIncidentUpdate.addEventListener("click", sendNotificationUpdate);
});

function showModal() {
  //Clear form
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";

  document.getElementById("sendUpdateModal").classList.remove("hidden");
}

function hideModal() {
  document.getElementById("sendUpdateModal").classList.add("hidden");
  hideErrorMessage();
}

function showErrorMessage(message) {
  document.getElementById("alertSendNotification").innerText = message;
  document.getElementById("alertSendNotification").classList.add("block");

  //Make the styling red
  document
    .getElementById("alertSendNotification")
    .classList.remove("border-green-400");
  document
    .getElementById("alertSendNotification")
    .classList.add("border-red-400");
  document
    .getElementById("alertSendNotification")
    .classList.remove("text-green-700");
  document
    .getElementById("alertSendNotification")
    .classList.add("text-red-700");
  document
    .getElementById("alertSendNotification")
    .classList.remove("bg-green-100");
  document.getElementById("alertSendNotification").classList.add("bg-red-100");
}

function showSuccessMessage(message) {
  document.getElementById("alertSendNotification").innerText = message;
  document.getElementById("alertSendNotification").classList.add("block");

  //Make the styling green
  document
    .getElementById("alertSendNotification")
    .classList.remove("border-red-400");
  document
    .getElementById("alertSendNotification")
    .classList.add("border-green-400");
  document
    .getElementById("alertSendNotification")
    .classList.remove("text-red-700");
  document
    .getElementById("alertSendNotification")
    .classList.add("text-green-700");
  document
    .getElementById("alertSendNotification")
    .classList.remove("bg-red-100");
  document
    .getElementById("alertSendNotification")
    .classList.add("bg-green-100");
}

function hideErrorMessage() {
  document.getElementById("alertSendNotification").classList.remove("block");
}

function showLoader() {
  document.getElementById("submitLoader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("submitLoader").classList.add("hidden");
}

function sendNotificationUpdate(e) {
  e.preventDefault();

  //Get the values to be sent
  let title = document.getElementById("title").value;
  title = "Incident Message: " + title;
  let message = document.getElementById("description").value;
  let email = document.getElementById("userEmail").value;
  email = email.split(":")[1].trim().toLowerCase();

  //  alert("email: " + email);

  //  alert("Sending notification to " + email + " with title: " + title + " and message: " + message);

  if (!title || !message || !email) {
    showErrorMessage("Please fill in all fields");
    return;
  }

  showLoader();

  //Send the notification
  fetch("/notifications/sendNotification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      message: message,
      recipient: email,
      notificationType: "Incident message",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader();
      if (data.message === "Notification sent successfully") {
        showSuccessMessage("Incident update sent successfully.");
      } else if (data.message === "User successfully notified via email") {
        showSuccessMessage(
          "Incident update sent successfully. External user notified via email."
        );
      } else {
        showErrorMessage(
          "An error occurred while sending out your incident update."
        );
      }
    })
    .catch((error) => {
      hideLoader();
      console.log("Error sending notification:", error);
      showErrorMessage("An error occurred while sending notification");
    });
}

function populateEmailField(userEmail, group) {
  //Show the modal
  showModal();
  let emailField = document.getElementById("userEmail");
  emailField.value = "To: " + userEmail;

  if (group === "everyone") {
    let modalSubheading = document.getElementById("modalSubheading");
    modalSubheading.innerText = "Update all users on this incident";
  } else {
    let modalSubheading = document.getElementById("modalSubheading");
    modalSubheading.innerText = `Update ${group} on this incident`;
  }
}

let fetchedIncidents;

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

    console.log("the length of the incidents is: " + incidents.length);

    //store the fetched incidents so that we can use them later for comparison when sending updates
    fetchedIncidents = incidents;

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

  if (!isNaN(date.getTime())) {
    // Checks if the date is valid
    incident.date = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  } else {
    // If date is invalid, keep it as it is, but remove the "T" characters
    incident.date = incident.date.replace("T", " ");
  }

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
  <div class="border border-black rounded-lg p-4 flex flex-col bg-white shadow-md">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div class="flex items-center text-sm w-full sm:w-auto mb-2 sm:mb-0">
      
    ${
      incident.userDetails.externalUser
        ? `<img src="/assets/profileIcon.webp" alt="Profile Picture" class="h-10 w-10 rounded-full mr-2">`
        : `<img src="/incidentReporting/getUserProfilePicture/${incident.userDetails.email}" alt="Profile Picture" class="h-10 w-10 rounded-full mr-2">`
    }
          
        <div class="flex-grow min-w-0">
          <p class="font-bold truncate">
            ${incident.userDetails.firstName} ${incident.userDetails.lastName}
            ${
              incident.userDetails.externalUser
                ? `<span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">${
                    JSON.stringify(incident.group).charAt(1).toUpperCase() +
                    JSON.stringify(incident.group).slice(2).replaceAll('"', "")
                  }</span>`
                : ""
            }
          </p>
          <p class="truncate">
            Reported: <span class="font-bold">${incident.title}</span>
          </p>
          <p class="text-xs text-gray-500">(${incident.date})</p>
        </div>
      </div>
      <div class="flex items-center mt-2 sm:mt-0">
       ${
         incident.location
           ? `<a href='https://www.google.com/maps?q=${latitude},${longitude}' target='_blank' class="mr-2"><img src="../assets/locationPick.webp" alt="Location" class="h-5 w-5 mr-2 cursor-pointer locationPick" data-lat="${latitude}" data-lng="${longitude}"></a>`
           : ""
       }
        ${
          incident.imageTrue
            ? `<a href='/incidentReporting/getIncidentImage/${incident._id}' target='_blank' class="mr-2"><img src="../assets/image.webp" alt="Image" class="h-5 w-5 cursor-pointer show-image"></a>`
            : ""
        }
        <select class="status-select bg-gray-300 rounded-lg px-2 py-1 text-sm" data-incident-id="${
          incident._id
        }">
          ${optionsHTML}
        </select>
      </div>
    </div>
    <p class="mt-2 text-sm">${incident.description}</p>
    <div class="flex mt-3 text-sm">
  <button onclick="populateEmailField('${incident.userDetails.email}', '${
    incident.userDetails.firstName
  }')" class="bg-[#015EB8] text-white py-1 px-2 rounded-lg hover:opacity-80 mx-3 text-xs sm:py-2 sm:px-4 sm:text-sm">
    Send an update to <span>${incident.userDetails.firstName}</span>
  </button>
  ${
    incident.userDetails.externalUser
      ? ""
      : `<button onclick="populateEmailField('Everyone','everyone')" class="bg-[#015EB8] text-white py-1 px-2 rounded-lg hover:opacity-80 mr-3 text-xs sm:py-2 sm:px-4 sm:text-sm">
    Send update to all users
  </button>`
  }
</div>
  </div>
</div>

  `;
  incidentsContainer.appendChild(incidentDiv);
}

// // Filter incidents based on selected statuses
// function filterIncidentsByStatus() {
//   const checkedStatuses = Array.from(
//     document.querySelectorAll(".status-filter:checked")
//   ).map((checkbox) => checkbox.value);

//   fetchAndDisplayIncidents()
//     .then(() => {
//       const incidentDivs = document.querySelectorAll("[id^=incident-]");
//       incidentDivs.forEach((div) => {
//         const selectElement = div.querySelector(".status-select");
//         if (!checkedStatuses.includes(selectElement.value)) {
//           div.style.display = "none";
//         } else {
//           div.style.display = "block";
//         }
//       });
//     })
//     .catch((error) => console.error("Error filtering incidents:", error));
// }

// Filter incidents based on selected statuses without making backend requests
function filterIncidentsByStatus() {
  // Get the selected statuses from the checkboxes
  const checkedStatuses = Array.from(
    document.querySelectorAll(".status-filter:checked")
  ).map((checkbox) => checkbox.value);

  // Filter the already fetched incidents stored in fetchedIncidents
  const incidentsContainer = document.getElementById("allIncidents");
  incidentsContainer.innerHTML = ""; // Clear existing content

  // Filter and display incidents based on the selected statuses
  fetchedIncidents
    .filter((incident) => checkedStatuses.includes(incident.status))
    .forEach((incident, index) => {
      addIncidentToDOM(incident, index);
    });
}

// Update incidents' statuses and re-filter based on current filters
async function updateIncidentsStatus() {
  const saveButton = document.getElementById("save");
  const saveLoader = document.getElementById("saveLoader");
  const message = document.getElementById("pageAlert");

  saveLoader.classList.remove("hidden");
  saveButton.disabled = true;

  const selectElements = document.querySelectorAll(".status-select");
  const updatedStatuses = Array.from(selectElements).map((select) => ({
    incidentId: select.getAttribute("data-incident-id"),
    status: select.value,
  }));

  const oldIncidents = fetchedIncidents; // From the DB
  const newIncidents = updatedStatuses; // From the UI
  const IncidentsToUpdate = [];

  // Create a map of oldIncidents for quick lookup by incidentId
  const oldIncidentMap = oldIncidents.reduce((map, incident) => {
    map[incident._id] = incident.status; // Use _id as the key and status as the value
    return map;
  }, {});

  // Compare each new incident's status with its old status using the map
  for (const newIncident of newIncidents) {
    const oldStatus = oldIncidentMap[newIncident.incidentId]; // Get the old status using the incidentId
    if (oldStatus !== newIncident.status) {
      IncidentsToUpdate.push(newIncident); // Add to the list if the status has changed
    }
  }

  console.log(IncidentsToUpdate); // Incidents that have had their status changed

  try {
    const response = await fetch("/incidentReporting/updateIncident", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ incidents: IncidentsToUpdate }),
    });

    if (response.ok) {
      // Update the fetchedIncidents array with new statuses
      for (const updatedIncident of IncidentsToUpdate) {
        // Find the incident in the fetchedIncidents array and update its status
        const incident = fetchedIncidents.find(
          (incident) => incident._id === updatedIncident.incidentId
        );
        if (incident) {
          incident.status = updatedIncident.status; // Update the status in fetchedIncidents
        }
      }

      // Re-filter and update the incidents displayed in the UI based on the current filters
      filterIncidentsByStatus(); // This will automatically refresh the UI based on checked statuses

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
