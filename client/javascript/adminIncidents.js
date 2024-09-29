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
  title = "Incident Update: " + title;
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
      notificationType: "incidentMessage",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader();
      if (data.message === "Notification sent successfully") {
        showSuccessMessage("Incident update sent successfully.");
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
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div class="flex flex-wrap items-center max-sm:text-xs text-sm mb-2 sm:mb-0">

          ${
            incident.userDetails.profilePicture
              ? `<img src="${incident.userDetails.profilePicture}" class="mr-2 h-5 w-5 rounded-full" alt="Profile">`
              : `<img src="../assets/user-profile.png" class="mr-2 h-5 w-5 rounded-full" alt="Profile">`
          }

            <p class="max-sm:text-xs mr-2"> 
              <span class="font-bold">
                ${
                  incident.userDetails.firstName +
                  " " +
                  incident.userDetails.lastName
                }
              </span> reported:
            </p>
            <p class="max-sm:text-xs font-bold mr-2">${incident.title}</p>
            <p class="max-sm:text-xs">(${incident.date})</p>
          </div>
          <div class="flex items-center">
            <img src="../assets/locationPick.png" alt="Location" class="h-5 w-5 cursor-pointer locationPick mr-2" data-lat="${latitude}" data-lng="${longitude}">
            ${
              incident.imageTrue
                ? `<a href='/incidentReporting/getIncidentImage/${incident._id}' target='_blank' class="mr-2"><img src="../assets/image.png" alt="Image" class="h-5 w-5 cursor-pointer show-image"></a>`
                : ""
            }
            <select class="status-select bg-gray-300 rounded-lg px-2 py-1 text-sm"
              data-incident-id="${incident._id}">
              ${optionsHTML}
            </select>
          </div>
        </div>
        <p class="mt-1 text-sm max-sm:text-xs">${incident.description}</p>
      </div>
      <div class="flex mt-3 text-sm">
        <button onclick="populateEmailField('${incident.userDetails.email}','${
    incident.userDetails.firstName
  }')" class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mx-3 max-sm:px-2">
          Send an update to <span>${incident.userDetails.firstName}</span>
        </button>
        <button onclick="populateEmailField('Everyone','everyone')" class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mr-3 max-sm:px-2">
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
