async function loadSafetyResources() {
    const response = await fetch('http://localhost:3000/user/userSafetyResources'); // Use the correct route
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

(async () => {
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
        
    textWrapper.appendChild(title);
    textWrapper.appendChild(description);
  
    resourceDiv.appendChild(img);
    resourceDiv.appendChild(textWrapper);

    // Create the buttons wrapper (top-right corner)
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add('absolute', 'top-2', 'right-4', 'flex', 'space-x-2');  // Important: absolute position relative to resourceDiv
    buttonsWrapper.style.right = '22px';

    // Create Edit Button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('bg-blue-500', 'text-white', 'rounded', 'px-2', 'py-1', 'text-sm');
    editButton.onclick = () => {
        // Add your edit functionality here
        alert(`Edit resource: ${resource.title}`);
    };

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('bg-red-500', 'rounded', 'px-2', 'py-1');
    
    // Create and append the image inside the delete button
    const deleteIcon = document.createElement('img');
    deleteIcon.src = '../assets/delete.png'; // Use the correct path to your delete icon
    deleteIcon.alt = 'Delete';
    deleteIcon.classList.add('w-4', 'h-4'); // Optional: Add classes to control the size of the image
    
    deleteButton.appendChild(deleteIcon);
    
    // Add delete functionality
    deleteButton.onclick = async () => {
        alert(`Delete resource: ${resource.title}`);
        const resourceId = resource._id; // Get the ID of the resource
        try {
            const response = await fetch(`http://localhost:3000/admin/deleteSafetyResources/${resourceId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Successfully deleted, now remove the bubble from the DOM
                resourceDiv.remove();
                alert('Resource deleted successfully!');
            } else {
                alert('Failed to delete resource');
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
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
})();