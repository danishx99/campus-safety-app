document.addEventListener("DOMContentLoaded", ()=> {

    // Fetch and display incidents based on the initial status filters
    fetchAndDisplayEvents();
    
    // Fetch and display incidents from the server
    async function fetchAndDisplayEvents() {
        const errorMessage = document.getElementById("alert");
        const loader = document.getElementById("loader");
        const incidentsContainer = document.getElementById("allEvents");
    
        // // Get the currently checked statuses
        // const checkedStatuses = Array.from(
        // document.querySelectorAll(".status-filter:checked")
        // ).map((checkbox) => checkbox.value);
    
        // Hide error message
        errorMessage.classList.remove("block");
    
        try {
        // Show loader and hide incidents container

        // alert("Welcome to events page!");
        loader.style.display = "block";
        incidentsContainer.style.display = "none";
    
        const response = await fetch("https://eventsapi3a.azurewebsites.net/api/events");
        const data = await response.json();
        const events = data.data;       // receive list of upcoming events - this is specific to events groups API

        // console.log(events);
        
    
        if (response.status !== 200) {
            errorMessage.innerText =
            "An internal server error occurred while fetching upcoming events";
            errorMessage.classList.add("block");
            return;
        }
    
        // Clear existing content
        incidentsContainer.innerHTML = "";
    
        // Check if there are no events
        if (events.length === 0) {
            errorMessage.innerText = "No events reported yet";
            errorMessage.classList.add("block");
            document.getElementById("save").disabled = true;
            document.getElementById("save").classList.add("cursor-not-allowed");
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
        const incidentsContainer = document.getElementById("allEvents");
    
        // const [latitude, longitude] = incident.location
        // .split(", ")
        // .map((coord) => parseFloat(coord));
    
        // const options = ["Pending", "In Progress", "Resolved"];
        // const optionsHTML = options
        // .map(
        //     (option) =>
        //     `<option value="${option}" ${
        //         incident.status === option ? "selected" : ""
        //     }>${option}</option>`
        // )
        // .join("");
    
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
                    ${event.eventAuthor}
                    </span> reported an incident:
                    <span class="font-bold">${event.title}</span>
                    (${event.date})
                </p>
            
                </div>
                
            </div>
            <p class="mt-1 text-sm max-sm:text-xs">${event.description}</p>
            </div>
            <div class="flex mt-3 text-sm">
            <button class="bg-[#015EB8] text-white py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mr-3 max-sm:px-2">
                Send announcement to all users
            </button>
            </div>
        </div>
        `;
        incidentsContainer.appendChild(incidentDiv);
    }
})