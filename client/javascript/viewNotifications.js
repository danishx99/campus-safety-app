   
    let currentPage = 1;
    const limit = 10; // Number of notifications per page
    function fetchNotifications(page = 1) {
        fetch(`/notifications/getAllNotifications?page=${page}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                document.getElementById("notificationsContainer").innerHTML = '';
                data.notifications.forEach(notification => {
                    createNotification(notification);
                });
                document.getElementById("prevPage").disabled = page === 1;
                document.getElementById("nextPage").disabled = page === data.totalPages;
                currentPage = data.currentPage;
                
                // Update page number display
                document.getElementById("currentPageNum").textContent = currentPage;
                document.getElementById("totalPages").textContent = data.totalPages;
            })
            .catch(error => {
                console.error("Error fetching notifications:", error);
            });
    }
    
    function createNotification(notification) {
        const incidentDiv = document.createElement("div");
        incidentDiv.className = "mb-6";
    
        const date = new Date(notification.createdAt).toLocaleString();
    
        // Apply specific styles based on the notification type
        let notificationTypeColor;
        switch (notification.notificationType.toLowerCase()) {
            case 'emergency-alert':
                notificationTypeColor = 'bg-red-100 text-red-600 border-red-500';
                break;
            case 'announcement':
                notificationTypeColor = 'bg-green-100 text-green-600 border-green-500';
                break;
            default:
                notificationTypeColor = 'bg-gray-100 text-gray-600 border-gray-500';
                break;
        }
    
        // Responsive and mobile-friendly layout
        incidentDiv.innerHTML = `
            <div class="border ${notificationTypeColor} rounded-lg p-4 bg-white shadow-md">
                <div class="mb-2">
                    <h3 class="font-semibold text-lg sm:text-xl mb-1">${notification.title}</h3>
                    <span class="text-sm text-gray-500">${date}</span>
                </div>
                <div class="text-gray-700 mb-4">
                    <strong>Message:</strong> ${notification.message}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="text-gray-700">
                        <strong>Recipient:</strong> ${notification.recipient}
                    </div>
                    <div class="text-gray-700">
                        <strong>Sender:</strong> ${notification.sender}
                    </div>
                    <div class="sm:col-span-2 text-gray-700">
                        <strong>Notification Type:</strong>
                        <span class="font-bold ${notificationTypeColor} px-2 py-1 rounded">${notification.notificationType}</span>
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

