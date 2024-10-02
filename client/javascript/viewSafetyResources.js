// Function to load safety resources
async function loadSafetyResources() {
    try {
        const response = await fetch('/safetyResources/userSafetyResources');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error loading safety resources:', error);
        return [];
    }
}

let currentResourceType = "Emergency Contact";

// Function to create resource element with enhanced styling and admin buttons
function createResource(resource) {
    if (resource.type !== currentResourceType) return null;

    const resourceDiv = document.createElement('div');
    resourceDiv.classList.add(
        'bg-gradient-to-r', 'from-blue-100', 'to-blue-200',
        'rounded-lg', 'shadow-md', 'p-4', 'mb-4',
        'flex', 'items-start', 'w-full', 'max-w-4xl', 'mx-auto',
        'transition-all', 'duration-300', 'hover:shadow-lg', 'hover:scale-105',
        'sm:flex-row', 'flex-col', 'relative'
    );

    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('flex-shrink-0', 'mr-4', 'mb-4', 'sm:mb-0');

    const img = document.createElement('img');
    img.src = getImageSource(resource.type);
    img.alt = resource.title;
    img.classList.add('w-10', 'h-10', 'object-contain', 'sm:w-12', 'sm:h-12');

    imgWrapper.appendChild(img);

    const textWrapper = document.createElement('div');
    textWrapper.classList.add('flex-grow');

    const title = document.createElement('h3');
    title.classList.add('text-lg', 'font-bold', 'text-blue-900', 'mb-1', 'sm:text-xl');
    title.textContent = resource.title;

    const description = document.createElement('p');
    description.classList.add('text-sm', 'text-blue-800', 'mb-2', 'sm:text-base');
    description.textContent = resource.description;

    textWrapper.appendChild(title);
    textWrapper.appendChild(description);

    // Only create and append the link if it exists and is not empty
    if (resource.link && resource.link.trim() !== "") {
        const link = document.createElement('a');
        link.classList.add(
            'text-sm', 'text-blue-600', 'hover:text-blue-800',
            'underline', 'font-semibold'
        );
        link.href = resource.link;
        link.textContent = "Learn More";
        link.target = "_blank";
        textWrapper.appendChild(link);
    }

    resourceDiv.appendChild(imgWrapper);
    resourceDiv.appendChild(textWrapper);

    // Add admin buttons
    const buttonsWrapper = createAdminButtons(resource, resourceDiv);
    resourceDiv.appendChild(buttonsWrapper);

    return resourceDiv;
}

function createAdminButtons(resource, resourceDiv) {
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.classList.add(
        'flex', 'space-x-2', 'mt-2', 
        'sm:absolute', 'sm:top-4', 'sm:right-4'
    );

    // Create Edit Button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add(
        'bg-blue-500', 'text-white', 'rounded', 'px-3', 'py-1', 
        'text-sm', 'hover:bg-blue-600', 'transition-colors'
    );
    editButton.onclick = () => {
        const resourceId = resource._id; 
        localStorage.setItem('resourceId', resourceId);
        window.location.href = "/admin/updateSafetyResources";
    };

    // Create Delete Button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add(
        'bg-red-500', 'hover:bg-red-600', 'rounded', 'px-3', 'py-1',
        'transition-colors', 'flex', 'items-center', 'justify-center'
    );
    
    const deleteIcon = document.createElement('img');
    deleteIcon.src = '../assets/delete.png';
    deleteIcon.alt = 'Delete';
    deleteIcon.classList.add('w-4', 'h-4');
    
    deleteButton.appendChild(deleteIcon);
    deleteButton.onclick = async () => {
        try {
            const response = await fetch(`/safetyResources/deleteSafetyResources/${resource._id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                resourceDiv.remove();
                showAlert("Resource deleted successfully", "success");
            } else {
                showAlert("Failed to delete resource", "error");
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            showAlert("Error deleting resource", "error");
        }
    };

    buttonsWrapper.appendChild(editButton);
    buttonsWrapper.appendChild(deleteButton);

    return buttonsWrapper;
}

// Helper function to get image source based on resource type
function getImageSource(type) {
    const imageMap = {
        'Emergency Contact': "../assets/phoneS.png",
        'Safety Tip': "../assets/safetyTipS.png",
        'Campus Safety Policy': "../assets/safetyPolicy.png"
    };
    return imageMap[type] || "";
}

function showAlert(message, type) {
    const alert = document.getElementById("alert");
    alert.classList.remove('hidden');
    alert.className = `p-4 mb-4 rounded text-center ${type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`;
    alert.innerText = message;

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 3000);
}

function showLoader() {
    const loader = document.getElementById("mapLoader");
    if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
    const loader = document.getElementById("mapLoader");
    if (loader) loader.classList.add('hidden');
}

// Function to update active button styles
function updateActiveButton(activeButton) {
    const buttons = [
        document.getElementById("btnViewContacts"),
        document.getElementById("btnViewtips"),
        document.getElementById("btnViewPolicies")
    ];

    buttons.forEach(button => {
        if (button === activeButton) {
            button.classList.add('bg-blue-600', 'text-white');
            button.classList.remove('bg-blue-200', 'text-blue-800');
        } else {
            button.classList.add('bg-blue-200', 'text-blue-800');
            button.classList.remove('bg-blue-600', 'text-white');
        }
    });
}

async function displayResources(resources, type) {
    const carousel = document.getElementById('carousel');
    carousel.innerHTML = '';
    currentResourceType = type;

    resources.forEach(resource => {
        const resourceElement = createResource(resource);
        if (resourceElement) {
            carousel.appendChild(resourceElement);
        }
    });

    hideLoader();
}

// Initialize page and add event listeners
async function initPage() {
    showLoader();
    
    const resources = await loadSafetyResources();
    
    // Get buttons
    const btnViewContacts = document.getElementById("btnViewContacts");
    const btnViewTips = document.getElementById("btnViewtips");
    const btnViewPolicies = document.getElementById("btnViewPolicies");
    
    // Add click event listeners
    btnViewContacts.addEventListener("click", () => {
        displayResources(resources, "Emergency Contact");
        updateActiveButton(btnViewContacts);
    });
    
    btnViewTips.addEventListener("click", () => {
        displayResources(resources, "Safety Tip");
        updateActiveButton(btnViewTips);
    });
    
    btnViewPolicies.addEventListener("click", () => {
        displayResources(resources, "Campus Safety Policy");
        updateActiveButton(btnViewPolicies);
    });

    // Initially display emergency contacts and set active button
    displayResources(resources, "Emergency Contact");
    updateActiveButton(btnViewContacts);
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPage);