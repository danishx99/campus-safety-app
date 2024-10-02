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

// Function to create resource element with enhanced styling, conditional link display, and call button for emergency contacts
function createResource(resource, type) {
  const resourceDiv = document.createElement('div');
  resourceDiv.classList.add(
      'bg-gradient-to-r', 'from-blue-100', 'to-blue-200',
      'rounded-lg', 'shadow-md', 'p-4', 'mb-4',
      'flex', 'items-start', 'w-full', 'max-w-4xl', 'mx-auto',
      'transition-all', 'duration-300', 'hover:shadow-lg', 'hover:scale-105',
      'sm:flex-row', 'flex-col' // Ensure responsiveness and stacking on mobile
  );

  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('flex-shrink-0', 'mr-4', 'mb-4', 'sm:mb-0');

  const img = document.createElement('img');
  img.src = getImageSource(type);
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

  // Add call button for emergency contacts
  if (type === "Emergency Contact") {
      const phoneNumber = extractPhoneNumber(resource.description);

      if (phoneNumber) {
          const callButton = document.createElement('a');
          callButton.href = `tel:${phoneNumber}`;
          callButton.classList.add(
              'bg-blue-500', 'hover:bg-blue-600', 'text-white', 'font-bold',
              'py-2', 'px-4', 'rounded', 'inline-flex', 'items-center',
              'transition-colors', 'duration-300', 'mr-2'
          );
          callButton.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>Call';
          textWrapper.appendChild(callButton);
      }
  }

  // Only create and append the link if it exists and is not empty
  if (resource.link && resource.link.trim() !== "") {
      const link = document.createElement('a');
      link.classList.add(
          'text-sm', 'text-blue-600', 'hover:text-blue-800',
          'underline', 'font-semibold', 'ml-2'
      );
      link.href = resource.link;
      link.textContent = "Learn More";
      link.target = "_blank";
      textWrapper.appendChild(link);
  }

  resourceDiv.appendChild(imgWrapper);
  resourceDiv.appendChild(textWrapper);

  return resourceDiv;
}

// Helper function to extract phone number from description
function extractPhoneNumber(description) {
  const phoneRegex = /\b(?:\+27|0)(?:\d{2}|\d{2} ?\d{3})(?: ?\d{4}|\d{7})\b/;
  const match = description.match(phoneRegex);
  return match ? match[0].replace(/\s/g, '') : null;
}

// Helper function to get image source based on resource type
function getImageSource(type) {
  switch (type) {
      case 'Emergency Contact':
          return "../assets/phoneS.png";
      case 'Safety Tip':
          return "../assets/safetyTipS.png";
      case 'Campus Safety Policy':
          return "../assets/safetyPolicy.png";
      default:
          return "";
  }
}

// Function to display resources
function displayResources(resources, type) {
  const carousel = document.getElementById('carousel');
  carousel.innerHTML = ''; // Clear existing content

  resources.forEach(resource => {
      if (resource.type === type) {
          const resourceElement = createResource(resource, type);
          carousel.appendChild(resourceElement);
      }
  });
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

// Main function to initialize the page
async function initPage() {
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
