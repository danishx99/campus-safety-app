document.addEventListener("DOMContentLoaded", function (){
    var resourceBtn = document.getElementById("btnResource");
    var alert = document.getElementById("alert");

    resourceBtn.addEventListener("click", function(event) {
        console.log("Add resource button clicked");

        title= document.getElementById("title").value;
        type = document.getElementById("resource-type").value;
        desc= document.getElementById("description").value;

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

        fetch("http://localhost:3000/admin/adminSafetyResources", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                type: type,
                description: desc
            })
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response data here
                if (data.message ==="Resource added successfully") {
                    alert.style.display = "block";
                    alert.style.color = 'green';
                    alert.style.backgroundColor = '#ddffdd';
                    alert.style.border='green';
                    alert.innerText = "Resource added successfully"
                    console.log(data);
                }
                
            })
            .catch(error => {
                // Handle any errors here
                console.error(error);
            });
    });
});