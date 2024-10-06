document.addEventListener("DOMContentLoaded", () => {
  const incidentsContainer = document.getElementById("allEvents");
  const errorMessage = document.getElementById("alert");
  const loader = document.getElementById("loader");

  function hideLoader() {
    document.getElementById("loader").style.display = "none";
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
      description:
        "Delano will be taliking about FCM stuff and finishing off Panic Button functionality",
      location: "Discord",
      date: "2024/09/28",
      startTime: "10:00",
      endTime: "21:33",
      isPaid: true,
      ticketPrice: 30000,
      maxAttendees: 5,
      currentAttendees: 0,
      category: ["hello", "hy"],
      images: [],
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
      images: [],
    },
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

      const response = await fetch(
        "https://eventsapi3a.azurewebsites.net/api/events/upcoming-events"
      );
      const data = await response.json();
      const events = data.data; // receive list of upcoming events - this is specific to events groups API
      // const events= mockEvents;

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
      events.forEach((event, index) => {
        addIncidentToDOM(event, index);
      });
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      errorMessage.innerText =
        "An error occurred while fetching upcoming events";
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
            <button id="send-announcement-btn-${index}" class="bg-[#015EB8] flex text-white items-center py-2 px-4 rounded-lg max-sm:text-xs hover:opacity-80 mr-3 max-sm:px-2">
                Send safety reminder to all users
                 <svg aria-hidden="true" class="w-4 h-4 ml-2 animate-spin hidden" viewBox="0 0 100 101"
                          fill="none" xmlns="http://www.w3.org/2000/svg" id="loader-${index}">
                          <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor" />
                          <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill" />
                    </svg>
            </button>
            </div>
        </div>
        `;
    incidentsContainer.appendChild(incidentDiv);

    function showLoader() {
      document.getElementById(`loader-${index}`).classList.remove("hidden");
    }

    function hideLoader() {
      document.getElementById(`loader-${index}`).classList.add("hidden");
    }

    // reroute to sendNotification page and pre-populate fields?
    document.getElementById(`send-announcement-btn-${index}`).onclick =
      async function () {
        showLoader();

        // send the announcement here
        try {
          title = `Safety reminder: ${event.title}`;
          notificationType = "announcement";
          recipient = "Everyone";
          recipient = recipient.toLowerCase();
          message = `Hi Witsies, Just a quick note about the event: ${event.title}. Time: ${event.startTime}, Date: ${event.date}, Location: ${event.location}. Please remember to stay safe and follow all safety guidelines. Refer to the website for safety resources and emergency contacts.`;
          // console.log(message);
          // return;

          const response = await fetch("/notifications/sendNotification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              message,
              notificationType,
              recipient,
            }),
          });

          const data = await response.json();

          if (response.status === 200) {
            // console.log("Success, well done Dan");

            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.style.color = "green";
            alert.style.backgroundColor = "#ddffdd";
            alert.style.border = "green";
            alert.innerText = data.message;
            window.scrollTo(0, 0);
            hideLoader();
          } else {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText = data.error;
            window.scrollTo(0, 0);
            hideLoader();
          }
        } catch (error) {
          console.error("Error sending notification of upcoming event:", error);
          errorMessage.innerText =
            "An error occurred while fetching upcoming events";
          errorMessage.classList.add("block");
          window.scrollTo(0, 0);
          hideLoader();
        } finally {
          loader.style.display = "none";
          incidentsContainer.style.display = "block";
        }
      };
  }
});
