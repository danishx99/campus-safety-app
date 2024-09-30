document.addEventListener("DOMContentLoaded", async function (){
    var btnCancel = document.getElementById("cancel");
    var btnSave = document.getElementById("btnSave");
    const resourceId = localStorage.getItem('resourceId');
    if (!resourceId) {
        console.error('No resource ID found in localStorage');
        alert('No resource ID found');
        return;
    }
    try {
        // Fetch the resource data using the resourceId
        const response = await fetch(`http://localhost:3000/safetyResources/getSafetyResource/${resourceId}`);
        const resource = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch resource');
        }

        // Prefill the form with the resource data
        document.getElementById('title').value = resource.title;
        document.getElementById('description').value = resource.description;
        document.getElementById('resource-type').value = resource.type;
        if (resource.link !== null){
            document.getElementById('link').value = resource.link;
        }
    } catch (error) {
        console.error('Error fetching resource data:', error);
        alert('Error loading resource data');
    }

    btnCancel.addEventListener("click", function(event) {
        window.location.href = 'http://localhost:3000/admin/viewSafetyResources';
    });

    btnSave.addEventListener("click", async function(event) {
        const resourceId = localStorage.getItem('resourceId');  // Retrieve the ID from localStorage
        if (!resourceId) {
            console.error('No resource ID found in localStorage');
            alert('No resource ID found');
            return;
        }
        title= document.getElementById("title").value;
        type = document.getElementById("resource-type").value;
        desc= document.getElementById("description").value;
        link= document.getElementById("link").value;
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
          const updatedResource = {
            title: title,
            type: type,
            description: desc,
            link: link
            };
          try {
            const response = await fetch(`http://localhost:3000/safetyResources/updateSafetyResource/${resourceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedResource), // Send the updated data
            });
    
            if (response.ok) {
                // Redirect back to some other page, e.g., the resources list
                window.location.href = 'http://localhost:3000/admin/viewSafetyResources';
            } else {
                alert('Failed to update resource');
            }
        } catch (error) {
            console.error('Error updating resource:', error);
        }
    });

});