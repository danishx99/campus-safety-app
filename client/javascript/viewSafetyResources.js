async function loadSafetyResources() {
    const response = await fetch('http://localhost:3000/safetyResources/userSafetyResources'); // Use the correct route
    const data = await response.json();

    return data.data;
};
/*const resources = [
    {
      title: "Campus Control",
      description: "Call +27 11 717 4444/6666 for emergency assistance",
      type: "Emergency Contact"
    },
    {
      title: "Medical Emergency",
      description: "Call +27 11 717 5555 for medical assistance",
      type: "Emergency Contact"
    },
    // Add more resources as needed
];*/

let emergencyContacts = false;
let safetyTips = false;
let safetyPolicy = false;

// Get buttons
var btnViewContacts = document.getElementById("btnViewContacts");
var btnViewTips = document.getElementById("btnViewtips");
var btnViewPolicies = document.getElementById("btnViewPolicies");

// Save the state in localStorage when a button is clicked
btnViewContacts.addEventListener("click", function(event) {
  emergencyContacts = true;
  safetyTips = false;
  safetyPolicy = false;
  localStorage.setItem("viewState", "contacts");
  location.reload();
});

btnViewTips.addEventListener("click", function(event) {
  emergencyContacts = false;
  safetyTips = true;
  safetyPolicy = false;
  localStorage.setItem("viewState", "tips");
  location.reload();
});

btnViewPolicies.addEventListener("click", function(event) {
  emergencyContacts = false;
  safetyTips = false;
  safetyPolicy = true;
  localStorage.setItem("viewState", "policies");
  location.reload();
});

// On page load, check the stored state and apply it
window.addEventListener("load", function() {
  const viewState = localStorage.getItem("viewState");

  if (viewState === "contacts") {
    emergencyContacts = true;
    safetyTips = false;
    safetyPolicy = false;
  } else if (viewState === "tips") {
    emergencyContacts = false;
    safetyTips = true;
    safetyPolicy = false;
  } else if (viewState === "policies") {
    emergencyContacts = false;
    safetyTips = false;
    safetyPolicy = true;
  } else {
    // Default to emergency contacts if nothing is set
    emergencyContacts = true;
  }
});

(async () => {
const resources = await loadSafetyResources(); // Wait for the resources to load


function createResource(resource) {
  let resourceDiv = null; // Initialize resourceDiv as null
  if (emergencyContacts === true){
    if (resource.type === "Emergency Contact"){
        console.log("contact")
        const resourceDiv = document.createElement('div');
        resourceDiv.classList.add(
        'bg-blue-100', 'rounded-full', 'py-6', 'px-8', 'text-center', 'flex', 'items-center', 'w-full', 'max-w-4xl', 'space-x-4', 'relative'  // Important: relative position added here
        );
  
        const img = document.createElement('img');
        img.src = "../assets/phoneS.png";
        img.alt = resource.title;
        img.classList.add('w-8', 'h-8', 'mr-4');

        const textWrapper = document.createElement('div');
        textWrapper.classList.add('text-center', 'flex-1');
  
        const title = document.createElement('p');
        title.classList.add('font-semibold', 'text-blue-900');
        title.innerHTML = `<strong>${resource.title}</strong>`;
  
        const description = document.createElement('p');
        description.classList.add('text-sm', 'text-blue-900');
        description.textContent = resource.description;

        const link = document.createElement('a')
        link.classList.add('text-sm', 'text-blue-900', 'font-semibold');
        link.href = resource.link;
        link.textContent = resource.link;
        link.target = "_blank";
        
        textWrapper.appendChild(title);
        textWrapper.appendChild(description);
        textWrapper.appendChild(link);
  
        resourceDiv.appendChild(img);
        resourceDiv.appendChild(textWrapper);

        // Create the buttons wrapper (top-right corner)
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.classList.add('absolute', 'top-8', 'right-4', 'flex', 'space-x-2');  // Important: absolute position relative to resourceDiv
        buttonsWrapper.style.right = '22px';

        // Create Edit Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('bg-blue-500', 'text-white', 'rounded', 'px-2', 'py-1', 'text-sm');
        editButton.onclick = () => {
            const resourceId = resource._id; 
            localStorage.setItem('resourceId', resourceId);
            window.location.href = "http://localhost:3000/admin/updateSafetyResources";
        };

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('bg-red-500', 'rounded', 'px-2', 'py-1');
    
        // Create and append the image inside the delete button
        const deleteIcon = document.createElement('img');
        deleteIcon.src = '../assets/delete.png';
        deleteIcon.alt = 'Delete';
        deleteIcon.classList.add('w-4', 'h-4');
    
        deleteButton.appendChild(deleteIcon);
    

        deleteButton.onclick = async () => {
            const resourceId = resource._id;
            try {
                const response = await fetch(`http://localhost:3000/safetyResources/deleteSafetyResources/${resourceId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    // Successfully deleted, now remove the bubble from the DOM
                    resourceDiv.remove();
                    const alert = document.getElementById("alert");
                    alert.style.display = "block";
                    alert.style.color = "green";
                    alert.style.backgroundColor = "#ddffdd";
                    alert.style.border = "1px solid green";
                    alert.innerText = "Resource deleted successfully";
                
                    // Set a timeout to hide the alert after 3 seconds
                    setTimeout(() => {
                        alert.style.display = "none";
                    }, 3000);
                } else {
                    const alert = document.getElementById("alert");
                    alert.style.display = "block";
                    alert.style.color = "red";
                    alert.style.backgroundColor = "#ffdddd";
                    alert.style.border = "1px solid red";
                    alert.innerText = "Failed to delete resource";
                
                    // Set a timeout to hide the alert after 3 seconds
                    setTimeout(() => {
                        alert.style.display = "none";
                    }, 3000);
                }
            } catch (error) {
                console.error('Error deleting resource:', error);
                const alert = document.getElementById("alert");
                alert.style.display = "block";
                alert.style.color = "red";
                alert.style.backgroundColor = "#ffdddd";
                alert.style.border = "1px solid red";
                alert.innerText = "Error deleting resource";
            
                // Set a timeout to hide the alert after 3 seconds
                setTimeout(() => {
                    alert.style.display = "none";
                }, 3000);
            }
        };

        // Append buttons to the wrapper
        buttonsWrapper.appendChild(editButton);
        buttonsWrapper.appendChild(deleteButton);

        // Add the buttons to the resourceDiv
        resourceDiv.appendChild(buttonsWrapper);

        return resourceDiv;
    }
  }
  else if (safetyTips === true){
    if (resource.type === "Safety Tip"){
      console.log("tip")
      const resourceDiv = document.createElement('div');
      resourceDiv.classList.add(
      'bg-blue-100', 'rounded-full', 'py-6', 'px-8', 'text-center', 'flex', 'items-center', 'w-full', 'max-w-4xl', 'space-x-4', 'relative'  // Important: relative position added here
      );

      const img = document.createElement('img');
      img.src = "../assets/safetyTipS.png";
      img.alt = resource.title;
      img.classList.add('w-8', 'h-8', 'mr-4');

      const textWrapper = document.createElement('div');
      textWrapper.classList.add('text-center', 'flex-1');

      const title = document.createElement('p');
      title.classList.add('font-semibold', 'text-blue-900');
      title.innerHTML = `<strong>${resource.title}</strong>`;

      const description = document.createElement('p');
      description.classList.add('text-sm', 'text-blue-900');
      description.textContent = resource.description;

      const link = document.createElement('a')
      link.classList.add('text-sm', 'text-blue-900', 'font-semibold');
      link.href = resource.link;
      link.textContent = resource.link;
      link.target = "_blank";
      
      textWrapper.appendChild(title);
      textWrapper.appendChild(description);
      textWrapper.appendChild(link);

      resourceDiv.appendChild(img);
      resourceDiv.appendChild(textWrapper);

      // Create the buttons wrapper (top-right corner)
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.classList.add('absolute', 'top-8', 'right-4', 'flex', 'space-x-2');  // Important: absolute position relative to resourceDiv
      buttonsWrapper.style.right = '22px';

      // Create Edit Button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('bg-blue-500', 'text-white', 'rounded', 'px-2', 'py-1', 'text-sm');
      editButton.onclick = () => {
          const resourceId = resource._id; 
          localStorage.setItem('resourceId', resourceId);
          window.location.href = "http://localhost:3000/admin/updateSafetyResources";
      };

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('bg-red-500', 'rounded', 'px-2', 'py-1');
  
      // Create and append the image inside the delete button
      const deleteIcon = document.createElement('img');
      deleteIcon.src = '../assets/delete.png';
      deleteIcon.alt = 'Delete';
      deleteIcon.classList.add('w-4', 'h-4');
  
      deleteButton.appendChild(deleteIcon);
  

      deleteButton.onclick = async () => {
          const resourceId = resource._id;
          try {
              const response = await fetch(`http://localhost:3000/safetyResources/deleteSafetyResources/${resourceId}`, {
                  method: 'DELETE',
              });
              if (response.ok) {
                  // Successfully deleted, now remove the bubble from the DOM
                  resourceDiv.remove();
                  const alert = document.getElementById("alert");
                  alert.style.display = "block";
                  alert.style.color = "green";
                  alert.style.backgroundColor = "#ddffdd";
                  alert.style.border = "1px solid green";
                  alert.innerText = "Resource deleted successfully";
              
                  // Set a timeout to hide the alert after 3 seconds
                  setTimeout(() => {
                      alert.style.display = "none";
                  }, 3000);
              } else {
                  const alert = document.getElementById("alert");
                  alert.style.display = "block";
                  alert.style.color = "red";
                  alert.style.backgroundColor = "#ffdddd";
                  alert.style.border = "1px solid red";
                  alert.innerText = "Failed to delete resource";
              
                  // Set a timeout to hide the alert after 3 seconds
                  setTimeout(() => {
                      alert.style.display = "none";
                  }, 3000);
              }
          } catch (error) {
              console.error('Error deleting resource:', error);
              const alert = document.getElementById("alert");
              alert.style.display = "block";
              alert.style.color = "red";
              alert.style.backgroundColor = "#ffdddd";
              alert.style.border = "1px solid red";
              alert.innerText = "Error deleting resource";
          
              // Set a timeout to hide the alert after 3 seconds
              setTimeout(() => {
                  alert.style.display = "none";
              }, 3000);
          }
      };

      // Append buttons to the wrapper
      buttonsWrapper.appendChild(editButton);
      buttonsWrapper.appendChild(deleteButton);

      // Add the buttons to the resourceDiv
      resourceDiv.appendChild(buttonsWrapper);

      return resourceDiv;
    }
  }
  else if (safetyPolicy === true){
    if (resource.type === "Campus Safety Policy"){
      console.log("policy")
      const resourceDiv = document.createElement('div');
      resourceDiv.classList.add(
      'bg-blue-100', 'rounded-full', 'py-6', 'px-8', 'text-center', 'flex', 'items-center', 'w-full', 'max-w-4xl', 'space-x-4', 'relative'  // Important: relative position added here
      );

      const img = document.createElement('img');
      img.src = "../assets/safetyPolicy.png";
      img.alt = resource.title;
      img.classList.add('w-8', 'h-8', 'mr-4');

      const textWrapper = document.createElement('div');
      textWrapper.classList.add('text-center', 'flex-1');

      const title = document.createElement('p');
      title.classList.add('font-semibold', 'text-blue-900');
      title.innerHTML = `<strong>${resource.title}</strong>`;

      const description = document.createElement('p');
      description.classList.add('text-sm', 'text-blue-900');
      description.textContent = resource.description;

      const link = document.createElement('a')
      link.classList.add('text-sm', 'text-blue-900', 'font-semibold');
      link.href = resource.link;
      link.textContent = resource.link;
      link.target = "_blank";
      
      textWrapper.appendChild(title);
      textWrapper.appendChild(description);
      textWrapper.appendChild(link);

      resourceDiv.appendChild(img);
      resourceDiv.appendChild(textWrapper);

      // Create the buttons wrapper (top-right corner)
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.classList.add('absolute', 'top-8', 'right-4', 'flex', 'space-x-2');  // Important: absolute position relative to resourceDiv
      buttonsWrapper.style.right = '22px';

      // Create Edit Button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.classList.add('bg-blue-500', 'text-white', 'rounded', 'px-2', 'py-1', 'text-sm');
      editButton.onclick = () => {
          const resourceId = resource._id; 
          localStorage.setItem('resourceId', resourceId);
          window.location.href = "http://localhost:3000/admin/updateSafetyResources";
      };

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('bg-red-500', 'rounded', 'px-2', 'py-1');
  
      // Create and append the image inside the delete button
      const deleteIcon = document.createElement('img');
      deleteIcon.src = '../assets/delete.png';
      deleteIcon.alt = 'Delete';
      deleteIcon.classList.add('w-4', 'h-4');
  
      deleteButton.appendChild(deleteIcon);
  

      deleteButton.onclick = async () => {
          const resourceId = resource._id;
          try {
              const response = await fetch(`http://localhost:3000/safetyResources/deleteSafetyResources/${resourceId}`, {
                  method: 'DELETE',
              });
              if (response.ok) {
                  // Successfully deleted, now remove the bubble from the DOM
                  resourceDiv.remove();
                  const alert = document.getElementById("alert");
                  alert.style.display = "block";
                  alert.style.color = "green";
                  alert.style.backgroundColor = "#ddffdd";
                  alert.style.border = "1px solid green";
                  alert.innerText = "Resource deleted successfully";
              
                  // Set a timeout to hide the alert after 3 seconds
                  setTimeout(() => {
                      alert.style.display = "none";
                  }, 3000);
              } else {
                  const alert = document.getElementById("alert");
                  alert.style.display = "block";
                  alert.style.color = "red";
                  alert.style.backgroundColor = "#ffdddd";
                  alert.style.border = "1px solid red";
                  alert.innerText = "Failed to delete resource";
              
                  // Set a timeout to hide the alert after 3 seconds
                  setTimeout(() => {
                      alert.style.display = "none";
                  }, 3000);
              }
          } catch (error) {
              console.error('Error deleting resource:', error);
              const alert = document.getElementById("alert");
              alert.style.display = "block";
              alert.style.color = "red";
              alert.style.backgroundColor = "#ffdddd";
              alert.style.border = "1px solid red";
              alert.innerText = "Error deleting resource";
          
              // Set a timeout to hide the alert after 3 seconds
              setTimeout(() => {
                  alert.style.display = "none";
              }, 3000);
          }
      };

      // Append buttons to the wrapper
      buttonsWrapper.appendChild(editButton);
      buttonsWrapper.appendChild(deleteButton);

      // Add the buttons to the resourceDiv
      resourceDiv.appendChild(buttonsWrapper);

      return resourceDiv;
    }
  }
}

const carousel = document.getElementById('carousel');
  
// Dynamically add all resources to the carousel
resources.forEach(resource => {
    const resourceElement = createResource(resource);
    if (resourceElement) {
      carousel.appendChild(resourceElement);
    }
});
})();

/*(async () => {
const resources = await loadSafetyResources(); // Wait for the resources to load

function createResource(resource) {
    const resourceDiv = document.createElement('div');
    resourceDiv.classList.add(
      'bg-blue-100', 'rounded-full', 'py-6', 'px-8', 'text-center', 'flex', 'items-center', 'w-full', 'max-w-4xl', 'space-x-4', 'relative'  // Important: relative position added here
    );
  
    const img = document.createElement('img');
    if (resource.type === "Emergency Contact") {
        img.src = "../assets/phoneS.png";
    }
    else if (resource.type === "Safety Tip"){
      img.src = "../assets/safetyTipS.png";
    }
    else if (resource.type === "Campus Safety Policy"){
      img.src = "../assets/safetyPolicy.png";
    }
    img.alt = resource.title;
    img.classList.add('w-8', 'h-8', 'mr-4');

    const textWrapper = document.createElement('div');
    textWrapper.classList.add('text-center', 'flex-1');
  
    const title = document.createElement('p');
    title.classList.add('font-semibold', 'text-blue-900');
    title.innerHTML = `<strong>${resource.title}</strong>`;
  
    const description = document.createElement('p');
    description.classList.add('text-sm', 'text-blue-900');
    description.textContent = resource.description;

    const link = document.createElement('a')
    link.classList.add('text-sm', 'text-blue-900', 'font-semibold');
    link.href = resource.link;
    link.textContent = resource.link;
    link.target = "_blank";
        
    textWrapper.appendChild(title);
    textWrapper.appendChild(description);
    textWrapper.appendChild(link);
  
    resourceDiv.appendChild(img);
    resourceDiv.appendChild(textWrapper);

    // Create the buttons wrapper (top-right corner)
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add('absolute', 'top-8', 'right-4', 'flex', 'space-x-2');  // Important: absolute position relative to resourceDiv
    buttonsWrapper.style.right = '22px';

    // Create Edit Button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('bg-blue-500', 'text-white', 'rounded', 'px-2', 'py-1', 'text-sm');
    editButton.onclick = () => {
        const resourceId = resource._id; 
        localStorage.setItem('resourceId', resourceId);
        window.location.href = "http://localhost:3000/admin/updateSafetyResources";
    };

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('bg-red-500', 'rounded', 'px-2', 'py-1');
    
    // Create and append the image inside the delete button
    const deleteIcon = document.createElement('img');
    deleteIcon.src = '../assets/delete.png';
    deleteIcon.alt = 'Delete';
    deleteIcon.classList.add('w-4', 'h-4');
    
    deleteButton.appendChild(deleteIcon);
    

    deleteButton.onclick = async () => {
        const resourceId = resource._id;
        try {
            const response = await fetch(`http://localhost:3000/safetyResources/deleteSafetyResources/${resourceId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Successfully deleted, now remove the bubble from the DOM
                resourceDiv.remove();
                const alert = document.getElementById("alert");
                alert.style.display = "block";
                alert.style.color = "green";
                alert.style.backgroundColor = "#ddffdd";
                alert.style.border = "1px solid green";
                alert.innerText = "Resource deleted successfully";
                
                // Set a timeout to hide the alert after 3 seconds
                setTimeout(() => {
                    alert.style.display = "none";
                }, 3000);
            } else {
                const alert = document.getElementById("alert");
                alert.style.display = "block";
                alert.style.color = "red";
                alert.style.backgroundColor = "#ffdddd";
                alert.style.border = "1px solid red";
                alert.innerText = "Failed to delete resource";
                
                // Set a timeout to hide the alert after 3 seconds
                setTimeout(() => {
                    alert.style.display = "none";
                }, 3000);
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            const alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.style.color = "red";
            alert.style.backgroundColor = "#ffdddd";
            alert.style.border = "1px solid red";
            alert.innerText = "Error deleting resource";
            
            // Set a timeout to hide the alert after 3 seconds
            setTimeout(() => {
                alert.style.display = "none";
            }, 3000);
        }
    };

    // Append buttons to the wrapper
    buttonsWrapper.appendChild(editButton);
    buttonsWrapper.appendChild(deleteButton);

    // Add the buttons to the resourceDiv
    resourceDiv.appendChild(buttonsWrapper);

    return resourceDiv;
}


const carousel = document.getElementById('carousel');

  
// Dynamically add all resources to the carousel
resources.forEach(resource => {
    const resourceElement = createResource(resource);
    carousel.appendChild(resourceElement);
});
})();*/