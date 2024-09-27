document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("incidentForm");
  const submitButton = document.getElementById("submitIncident");
  const loader = document.getElementById("saveLoader");
  const viewPastIncidents = document.getElementById("viewPastIncidents");

  viewPastIncidents.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default form submission
    window.location.href = "/user/viewPastIncidents";
  });

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    console.log("Submitting incident clicked");

    // Get form data
    const title = document.getElementById("incidentTitle").value;
    const incidentType = document.getElementById("incidentType").value;
    const imageFile = document.getElementById("imageUpload").files[0];
    const description = document.getElementById("incidentDesc").value;
    const location = document.getElementById("incidentLocation").value;
    const dateTime = document.getElementById("incidentDateTime").value;

    const alert = document.getElementById("incidentAlert");
    alert.style.display = "none";
    //make the alert message red
    alert.classList.add("bg-red-100");
    alert.classList.add("text-red-500");
    alert.classList.add("border-red-300");
    alert.classList.remove("bg-green-100");
    alert.classList.remove("text-green-500");
    alert.classList.remove("border-green-300");

    //console.log(title, incidentType, description, location, dateTime);

    // Validate the form data
    if (!title || !incidentType || !description || !location || !dateTime) {
      alert.textContent = "Please fill in all fields";
      alert.style.display = "block";
      return;
    }
    // Validate the image file
    if (imageFile && !imageFile.type.startsWith("image")) {
      alert.textContent = "Please select a valid image file";
      alert.style.display = "block";
      return;
    }

    // Validate the date and time
    const now = new Date();
    const incidentDateTime = new Date(dateTime);
    if (incidentDateTime > now) {
      alert.textContent = "Please select a valid date and time";
      alert.style.display = "block";
      return;
    }

    // Convert image file to Base64 string
    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = await convertImageToBase64(imageFile);
    }

    // Prepare data to send
    const data = {
      title,
      type: incidentType,
      description,
      location,
      date: dateTime,
      image: imageBase64 || null,
    };

    console.log(data);

    // Show loader
    loader.style.display = "block";

    try {
      const response = await fetch("/incidentReporting/reportIncident", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      // Hide loader
      loader.style.display = "none";
      //console.log("here");

      const result = await response.json();

      console.log(result);
      console.log(response.status);

      if (response.status === 200) {
        console.log("Incident submitted successfully");
        // Show success message
        alert.innerText = "Incident reported successfully";
        alert.style.display = "block";
        alert.classList.add("block");
        alert.classList.add("bg-green-100");
        alert.classList.add("text-green-500");
        alert.classList.add("border-green-300");
        setTimeout(() => {
          alert.classList.remove("block");
          alert.classList.remove("bg-green-300");
          alert.classList.remove("text-green-800");
          alert.classList.remove("border-green-400");
          alert.style.display = "none";
        }, 2000);
        form.reset();
      } else {
        // Handle error response
        console.error("Error submitting incident:", result);
        alert.textContent = result.error || "An error occurred";
        alert.style.display = "block";
      }
    } catch (error) {
      console.error("Error submitting incident:", error);
      // Handle network errors
      alert.textContent = "An error occurred while submitting the incident";
      alert.style.display = "block";
      //hide loader
      loader.style.display = "none";
    }
  });

  // Function to convert image file to Base64
  function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]); // Remove data URL prefix
      reader.onerror = reject;
      reader.readAsDataURL(file); // Read the file as a Data URL (Base64)
    });
  }
});
