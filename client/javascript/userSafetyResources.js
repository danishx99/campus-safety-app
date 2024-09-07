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
      'bg-blue-100', 'rounded-full', 'py-6', 'px-8', 'text-center', 'flex', 'items-center', 'w-full', 'max-w-4xl', 'space-x-4'
    );
  
    const img = document.createElement('img');
    /*if (resource.type === "Emergency Contact") {
        img.src = "../assets/phone.png";
    }*/
    img.src = "../assets/phone.png";
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

    return resourceDiv;
}

const carousel = document.getElementById('carousel');
  
// Dynamically add all resources to the carousel
resources.forEach(resource => {
    const resourceElement = createResource(resource);
    carousel.appendChild(resourceElement);
});
})();