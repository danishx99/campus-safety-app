
document.addEventListener("DOMContentLoaded", function () {
    loadHeader();
    loadNavbar();
    loadComponent("footer-placeholder", "../html/components/footer.html");
});

function loadHeader() {
    const userRole = getUserRoleFromPage(); // Get role from page attribute

    if (userRole === 'admin') {
        loadComponent("header-placeholder", "../html/components/adminHeader.html");
    } else {
        loadComponent("header-placeholder", "../html/components/userHeader.html");
    }
}

function loadNavbar() {
    const userRole = getUserRoleFromPage(); // Get role from page attribute

    if (userRole === 'admin') {
        loadComponent("navbar-placeholder", "../html/components/adminNavbar.html");
    } else {
        loadComponent("navbar-placeholder", "../html/components/userNavbar.html");
    }
}

// Function to get the user role from the "page" attribute in <body>
function getUserRoleFromPage() {
    const body = document.querySelector('body');
    return body.getAttribute('page') || 'user'; // Default to 'user' if no page attribute is found
}

// Function to load a component from an HTML file into the specified element
function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            element.innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}
