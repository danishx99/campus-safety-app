let currentPage = 1;
const limit = 10; // Number of notifications per page

function showLoader() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("notificationsContainer").innerHTML = "";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}
function fetchNotifications(page = 1) {
  showLoader();
  fetch(`/notifications/getAllNotifications?page=${page}&limit=${limit}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.getElementById("notificationsContainer").innerHTML = "";
      data.notifications.forEach((notification) => {
        createNotification(notification);
      });
      document.getElementById("prevPage").disabled = page === 1;
      document.getElementById("nextPage").disabled = page === data.totalPages;
      currentPage = data.currentPage;

      // Update page number display
      document.getElementById("currentPageNum").textContent = currentPage;
      document.getElementById("totalPages").textContent = data.totalPages;

      hideLoader();
    })
    .catch((error) => {
      console.error("Error fetching notifications:", error);
    });
}

function createNotification(notification) {
  const incidentDiv = document.createElement("div");
  incidentDiv.className = "mb-6";

  const date = new Date(notification.createdAt).toLocaleString();

  // Enhanced notification type styling
  let notificationTypeColor;
  let notificationIcon;

  switch (notification.notificationType.toLowerCase()) {
    case "emergency-alert":
      notificationTypeColor =
        "bg-red-50 text-red-700 border-red-200 ring-red-600/20";
      notificationIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`;
      notification.notificationType = "Emergency alert";
      break;
    case "announcement":
      notificationTypeColor =
        "bg-green-50 text-green-700 border-green-200 ring-green-600/20";
      notificationIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>`;
      break;
    case "incident update":
      notificationTypeColor =
        "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
      notificationIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>`;
      break;
    default:
      notificationTypeColor =
        "bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20";
      notificationIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`;
      break;
  }

  incidentDiv.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div class="p-6">
                <!-- Header Section with Icon -->
                <div class="flex gap-4 mb-4">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50">
                            ${notificationIcon}
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">${
                                  notification.title
                                }</h3>
                                <span class="text-sm text-gray-500">${date}</span>
                            </div>
                            <span class="items-center text-center rounded-full px-3 py-1 text-sm font-medium ${notificationTypeColor} ring-1 ring-inset whitespace-nowrap max-w-40">
                                ${
                                  notification.notificationType
                                    .charAt(0)
                                    .toUpperCase() +
                                  notification.notificationType.slice(1)
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Message Section -->
                <div class="">
                    <p class="text-gray-700 leading-relaxed">${
                      notification.message
                    }</p>
                </div>

                <!-- Footer Section -->
                <div class="border-t border-gray-200 pt-4 mt-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-gray-500"><b>Recipient</b> : ${
                              notification.recipient.charAt(0).toUpperCase() +
                              notification.recipient.slice(1)
                            }</span>
                           
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-gray-500"><b>Sender</b> : ${
                              notification.sender
                            }</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.getElementById("notificationsContainer").appendChild(incidentDiv);
}

// Handle pagination buttons
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchNotifications(currentPage);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  currentPage++;
  fetchNotifications(currentPage);
});

// Initial fetch for the first page of notifications
fetchNotifications(currentPage);
