document.addEventListener("DOMContentLoaded", function () {
    loadHeader();
    loadNavbar();
    loadComponent("footer-placeholder", "../html/components/footer.html");
});

async function loadHeader() {
    try {
        const response = await fetch('/profile/getCurrentUser', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.user && data.user.role === 'admin') {
            loadComponent("header-placeholder", "../html/components/adminHeader.html");
        } else {
            loadComponent("header-placeholder", "../html/components/userHeader.html");
        }
    } catch (error) {
        console.error('Error loading header:', error);
        // Load user header as fallback
        loadComponent("header-placeholder", "../html/components/userHeader.html");
    }
}

async function loadNavbar() {
    try {
        const response = await fetch('/profile/getCurrentUser', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.user && data.user.role === 'admin') {
            loadComponent("navbar-placeholder", "../html/components/adminNavbar.html");
        } else {
            loadComponent("navbar-placeholder", "../html/components/userNavbar.html");
        }
    } catch (error) {
        console.error('Error loading navbar:', error);
        // Load user navbar as fallback
        loadComponent("navbar-placeholder", "../html/components/userNavbar.html");
    }
}

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
