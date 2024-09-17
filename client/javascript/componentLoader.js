// ComponentLoader.js

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.componentPromises = new Map();
    }

    async loadComponent(elementId, filePath) {
        if (this.loadedComponents.has(elementId)) {
            console.warn(`Component ${elementId} already loaded.`);
            return;
        }

        if (!this.componentPromises.has(filePath)) {
            this.componentPromises.set(filePath, this.fetchComponent(filePath));
        }

        try {
            const content = await this.componentPromises.get(filePath);
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = content;
                this.loadedComponents.add(elementId);
            } else {
                console.warn(`Element with id ${elementId} not found.`);
            }
        } catch (error) {
            console.error(`Error loading component ${elementId}:`, error);
        }
    }

    async fetchComponent(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.statusText}`);
        }
        return response.text();
    }

    async loadUserData() {
        try {
            const response = await fetch('/profile/getCurrentUser', {
                method: 'GET',
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Error loading user data:', error);
            return { user: null };
        }
    }

    async initializeApp() {
        const userData = await this.loadUserData();
        const isAdmin = userData.user && userData.user.role === 'admin';

        const headerPath = isAdmin ? "../html/components/adminHeader.html" : "../html/components/userHeader.html";
        const navbarPath = isAdmin ? "../html/components/adminNavbar.html" : "../html/components/userNavbar.html";

        await Promise.all([
            this.loadComponent("header-placeholder", headerPath),
            this.loadComponent("navbar-placeholder", navbarPath),
            this.loadComponent("footer-placeholder", "../html/components/footer.html")
        ]);

        document.dispatchEvent(new Event('componentsLoaded'));
    }
}

// Usage
const loader = new ComponentLoader();
document.addEventListener("DOMContentLoaded", () => loader.initializeApp());

// You can now listen for the 'componentsLoaded' event to run any code that depends on the components being loaded
document.addEventListener('componentsLoaded', () => {
    console.log('All components have been loaded');
    // Run any initialization code that depends on the components here
});