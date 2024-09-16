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
            loadComponent("header-placeholder", "../html/components/adminHeader.html", attachPanicButtonListener);
        } else {
            loadComponent("header-placeholder", "../html/components/userHeader.html", attachPanicButtonListener);
        }
    } catch (error) {
        console.error('Error loading header:', error);
        // Load user header as fallback
        loadComponent("header-placeholder", "../html/components/userHeader.html", attachPanicButtonListener);
    }
}

// Function to attach event listeners after the header is loaded
function attachPanicButtonListener() {
    var panicBtn = document.getElementById('panicBtn');
    var modal = document.getElementById("incidentModal"); 
    var span = document.getElementById("closeModalBtn");
    
    var sendBtn = document.getElementById("submitEmergency");

    panicBtn.addEventListener('click', function(event){
        event.preventDefault();
        console.log("Panic button clicked");
        modal.style.display = "block";
    });

    sendBtn.addEventListener('click', function(event){
        event.preventDefault();
        var title = document.getElementById("title").value;
        var description = document.getElementById("description").value;
        console.log("Emergency sent");
        console.log(title);
        console.log(description);
        //modal.style.display = "none";
    });

    span.addEventListener('click', function() {
        modal.style.display = "none";
    });

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
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

function loadComponent(elementId, filePath, callback) {
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
            if (callback && typeof callback === 'function') {
                callback();  // Execute the callback after the component is loaded
            }
        })
        .catch(error => console.error('Error loading component:', error));
}

