document.addEventListener("DOMContentLoaded", function () {
  var resourceBtn = document.getElementById("btnResource");
  var viewBtn = document.getElementById("viewResources");
  var alert = document.getElementById("alert");

  resourceBtn.addEventListener("click", function (event) {
    console.log("Add resource button clicked");

    title = document.getElementById("title").value;
    type = document.getElementById("resource-type").value;
    desc = document.getElementById("description").value;

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
    fetch("http://localhost:3000/admin/adminSafetyResources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        type: type,
        description: desc,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data here
        if (data.message === "Resource added successfully") {
          alert.style.display = "block";
          alert.style.color = "green";
          alert.style.backgroundColor = "#ddffdd";
          alert.style.border = "green";
          alert.innerText = "Resource added successfully";
          console.log(data);
        }
      })
      .catch((error) => {
        // Handle any errors here
        console.error(error);
      });
  });

  viewBtn.addEventListener("click", function (event) {
    console.log("View resource button clicked");
    window.location.href = "http://localhost:3000/admin/viewSafetyResources";
  });

  /*async function deleteAllResources() {
        console.log("Delete resource button clicked");
        if (confirm('Are you sure you want to delete all safety resources? This action cannot be undone.')) {
          try {
            const response = await fetch('http://localhost:3000/admin/deleteSafetyResources', {
              method: 'DELETE'
            });
            const result = await response.json();
            if (response.ok) {
                alert.style.display = "block";
                alert.style.color = 'green';
                alert.style.backgroundColor = '#ddffdd';
                alert.style.border='green';
                alert.innerText = "Resource deleted successfully"
              // Optionally, refresh the list of resources after deletion
              // loadSafetyResources();
            } else {
              alert('Error: ' + result.error);
            }
          } catch (error) {
            console.error('Error deleting resources:', error);
          }
        }
      }
      // Attach the delete function to the button
      document.getElementById('deleteAll').addEventListener('click', deleteAllResources);*/
});
