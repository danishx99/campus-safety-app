document.addEventListener("DOMContentLoaded", function () {
    loadComponent("header-placeholder", "../html/components/header.html");
    loadComponent("navbar-placeholder", "../html/components/navbar.html");
    loadComponent("footer-placeholder", "../html/components/footer.html");
});

function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}
