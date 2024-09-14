document.addEventListener("DOMContentLoaded", function () {
    loadComponent("header-placeholder", "../html/components/header.html");
    loadComponent("navbar-placeholder", "../html/components/navbar.html");
    loadComponent("footer-placeholder", "../html/components/footer.html");
});

function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) {
        //console.error(`Element with ID "${elementId}" not found.`);
        return; // Exit the function if the element is not found
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
