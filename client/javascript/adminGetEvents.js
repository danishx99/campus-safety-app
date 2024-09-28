document.addEventListener("DOMContentLoaded", ()=> {

    const incidentsContainer = document.getElementById("allEvents");    
    const errorMessage = document.getElementById("alert");
    const loader = document.getElementById("loader");

    function hideLoader(){
        document.getElementById('loader').style.display = 'none';
    }

    let title;
    let message;
    let notificationType;
    let recipient;

    // Fetch and display incidents based on the initial status filters
    fetchAndDisplayEvents();

    // Define the mockEvent variable with the provided data
    const mockEvents = [
        {
            id: "66e90631ae9d378896f314cd",
            event_id: 1002,
            eventAuthor: "Chicken Tendies",
            title: "Notification Stuff",
            description: "Delano will be taliking about FCM stuff and finishing off Panic Button functionality",
            location: "Discord",
            date: "2024/09/28",
            startTime: "10:00",
            endTime: "21:33",
            isPaid: true,
            ticketPrice: 30000,
            maxAttendees: 5,
            currentAttendees: 0,
            category: ["hello", "hy"],
            images: []
        },
        {
            id: "66e90618ae9d378896f314ca",
            event_id: 1001,
            eventAuthor: "Wits SRC",
            title: "Freshers concert 2024",
            description: "Come have a good time guys",
            location: "Sturrock Park",
            date: "2024/09/30",
            startTime: "18:30",
            endTime: "21:33",
            isPaid: true,
            ticketPrice: 30000,
            maxAttendees: 300,
            currentAttendees: 0,
            category: ["hello", "hy"],
            images: []
        }
    ];
    
    // Fetch and display incidents from the server
    async function fetchAndDisplayEvents() {
    
        // Hide error message
        errorMessage.classList.remove("block");
    
        try {
        // Show loader and hide incidents container

        // alert("Welcome to events page!");
        loader.style.display = "block";
        incidentsContainer.style.display = "none";
    
        const response = await fetch("https://eventsapi3a.azurewebsites.net/api/events/upcoming-events");
        const data = await response.json();
        // const events = data.data;       // receive list of upcoming events - this is specific to events groups API
        const events= mockEvents;

        // console.log(events);
        
    
        if (response.status !== 200) {
            errorMessage.innerText =
            "An internal server error occurred while fetching upcoming events";
            errorMessage.classList.add("block");
            return;
        }
    
        // Clear existing content
        incidentsContainer.innerHTML = "";
        // console.log(events.length);
    
        // Check if there are no events
        if (events.length === 0) {
            errorMessage.innerText = "No events reported yet";
            errorMessage.classList.add("block");
            return;
        }

        // Display events 
        events
        .forEach((event, index) => {
        addIncidentToDOM(event, index);        
        });
    
        } catch (error) {
        console.error("Error fetching upcoming events:", error);
        errorMessage.innerText = "An error occurred while fetching upcoming events";
        errorMessage.classList.add("block");
        } finally {
        loader.style.display = "none";
        incidentsContainer.style.display = "block";
        }
    }

    // now add events to the DOM 
    function addIncidentToDOM(event, index) {

        const incidentDiv = document.createElement("div");
        incidentDiv.className = "mb-6";
    
        incidentDiv.innerHTML = `
        <div id="incident-${index}" class="mb-6">
            <div class="border border-black rounded-lg p-2 flex flex-col bg-white">
            <div class="flex justify-between">
                <div class="flex items-center max-sm:text-xs text-sm">
                <p class="max-sm:text-xs"> 
                    <span class="font-bold ">
                    ${event.eventAuthor}
                    </span> is hosting an event:
                    <span class="font-bold">${event.title}</span>
                    (${event.date}) at ${event.location}
                    <br>
                    Time: ${event.startTime}
                    <br>
                    Max attendees: ${event.maxAttendees}
                </p>
            
                </div>
                
            </div>
            <p class="mt-1 text-sm max-sm:text-xs">${event.description}</p>
            </div>
            <div class="flex mt-3 text-sm">
            <button id="send-announcement-btn-${index}" class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mr-3 max-sm:px-2">
                Send announcement to all users
            </button>
            </div>
        </div>
        `;
        incidentsContainer.appendChild(incidentDiv);

        // reroute to sendNotification page and pre-populate fields?
        document.getElementById(`send-announcement-btn-${index}`).onclick = async function() {
            
            // send the announcement here
            try {

                title = `${event.title} (${event.date}) at ${event.location}`;              
                notificationType = 'announcement';            
                recipient = 'Everyone';
                recipient = recipient.toLowerCase();
                message = `Hi Witsies, a kind note about ${title}.\n Time: ${event.startTime}. \n Max Attendees: ${event.maxAttendees} 
                \n ${event.description}`

                // console.log(message);
                // return;
                

                const response = await fetch('/notifications/sendNotification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, message, notificationType, recipient }),
                });

                const data = await response.json();
                if (response.status === 200) {
                    // console.log("Success, well done Dan");
                    
                    var alert = document.getElementById('alert');
                    alert.style.display = 'block';
                    alert.style.color = 'green';
                    alert.style.backgroundColor = '#ddffdd';
                    alert.style.border = 'green';
                    alert.innerText = data.message;
                    window.scrollTo(0, 0);
                    hideLoader();

                } else {
                    var alert = document.getElementById('alert');
                    alert.style.display = 'block';
                    alert.innerText = data.error;
                    window.scrollTo(0, 0);
                    hideLoader();
                }
            } catch (error) {
                console.error("Error sending notification of upcoming event:", error);
                errorMessage.innerText = "An error occurred while fetching upcoming events";
                errorMessage.classList.add("block");
                window.scrollTo(0, 0);
            }
            finally {
                loader.style.display = "none";
                incidentsContainer.style.display = "block";
                }
        };
    }
    
})