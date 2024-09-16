document.addEventListener("DOMContentLoaded", function(){
    console.log("User dashboard loaded!");
    
    const reportCard=document.getElementById("report-incident-card");
    const notificationsCard=document.getElementById("view-notifications-card");
    const locationCard=document.getElementById("location-services-card");
    const safetyCard=document.getElementById("safety-resources-card");


    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const verifyEmailBtn = document.getElementById('verifyEmailBtn');
    const closeToastBtn = document.getElementById('closeToastBtn');

    let isEmailVerified = false;

    // Function to show toast with custom message
    function showToast(message, hideButtons = false) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        if (hideButtons) {
            verifyEmailBtn.style.display = 'none';
            closeToastBtn.style.display = 'none';
        } else {
            verifyEmailBtn.style.display = 'inline-block';
            closeToastBtn.style.display = 'inline-block';
        }
    }

    // Check if the user has verified their email
    fetch('/auth/checkEmailVerification', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        isEmailVerified = data.isVerified;
        if (!isEmailVerified) {
            showToast('Please verify your email to access all features.');
        }
    })
    .catch(error => {
        console.error('Error checking email verification:', error);
        showToast('An error occurred while checking your email verification status.');
    });

    // Send verification email
    verifyEmailBtn.addEventListener('click', function() {
        fetch('auth/sendVerification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Verification Email Successfully Sent!") {
                showToast('Verification email sent successfully. Please check your inbox.', true);
            } else {
                showToast('An error occurred while sending the verification email.', true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('An error occurred while sending the verification email.', true);
        });
    });

    // Close the toast notification
    closeToastBtn.addEventListener('click', function() {
        toast.classList.add('hidden');
    });

    const cards = document.querySelectorAll('.card-link');

    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isEmailVerified) {
                showToast('Please verify your email to access this feature.', true);
                return;
            }

            // If email is verified, proceed with navigation
            switch(this.id) {
                case 'reported-incidents-card':
                    window.location.href = 'userIncidentReporting.html';
                    break;
                case 'send-notifications-card':
                    window.location.href = '/admin/sendNotifications';
                    break;
                case 'location-services-card':
                    window.location.href = 'locationServices.html';
                    break;
                case 'safety-resources-card':
                    window.location.href = 'userSafetyResources.html';
                    break;
            }
        });
    });

    reportCard.addEventListener("click", function(event){
        event.preventDefault();

        window.location.href="/user/reportIncident";
        
    });

    notificationsCard.addEventListener("click", function(event){
        event.preventDefault();

        alert("Delano show me some notifications!");
        
        
    });

    locationCard.addEventListener("click", function(event){
        event.preventDefault();

        alert("Who is in charge of location again?");
        
    });

    safetyCard.addEventListener("click", function(event){
        event.preventDefault();

        window.location.href="/user/safetyResources";
        
    });
    

    

    
})