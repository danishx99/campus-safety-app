document.addEventListener("DOMContentLoaded", function () {
  var resourceBtn = document.getElementById("btnResource");
  var viewBtn = document.getElementById("viewResources");
  var alert = document.getElementById("alert");

  let title = document.getElementById("title");
  let type = document.getElementById("resource-type");
  let desc = document.getElementById("description");
  let link = document.getElementById("link");

  if (type.value === "Emergency Contact") {
    desc.placeholder = "Health Sciences Campus: 011 717 2222";
  }

  // Add event listener to check for 'resource-type' changes
  type.addEventListener("change", function () {
    const selectedType = type.value;

    // If the type is 'emergency contact', set placeholder for description
    if (selectedType === "Emergency Contact") {
      desc.placeholder = "Health Sciences Campus: 011 717 2222";
    } else {
      desc.placeholder = ""; // Clear placeholder for other types
    }
  });

  resourceBtn.addEventListener("click", function (event) {
    console.log("Add resource button clicked");

    title = title.value;
    type = type.value;
    desc = desc.value;
    link = link.value;

    if (
      !title ||
      !type ||
      !desc ||
      title === "" ||
      type === "" ||
      desc === ""
    ) {
      alert.style.display = "block";
      alert.innerText = "Please fill in all fields";
      return;
    }

    console.log("Details succesfully captured, time to post!");
    document.getElementById("title").value = null;
    document.getElementById("resource-type").value = null;
    document.getElementById("description").value = null;
    document.getElementById("link").value = null;
    console.log("Link value:", link);
    fetch("/safetyResources/adminSafetyResources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        type: type,
        description: desc,
        link: link,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data here
        if (data.message === "Resource added successfully") {
          alert.style.display = "block";
          alert.style.color = "green";
          alert.style.backgroundColor = "#ddffdd";
          alert.style.border = "1px solid green";
          alert.innerText = "Resource added successfully";
          // Set a timeout to hide the alert after 3 seconds
          setTimeout(() => {
            alert.style.display = "none";
          }, 3000);
        } else {
          alert.style.display = "block";
          alert.style.color = "red";
          alert.style.backgroundColor = "#ffdddd";
          alert.style.border = "1px solid red";
          alert.innerText = "Failed to add resource";
          // Set a timeout to hide the alert after 3 seconds
          setTimeout(() => {
            alert.style.display = "none";
          }, 3000);
        }
      })
      .catch((error) => {
        // Handle any errors here
        console.error(error);
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "1px solid red";
        alert.innerText = "Error adding resource";
        // Set a timeout to hide the alert after 3 seconds
        setTimeout(() => {
          alert.style.display = "none";
        }, 3000);
      });
  });

  viewBtn.addEventListener("click", function (event) {
    console.log("View resource button clicked");
    window.location.href = "/admin/viewSafetyResources";
  });
});
