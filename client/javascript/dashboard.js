document.addEventListener('DOMContentLoaded', function() {
    // Check if the user has verified their email

    const isEmailVerified = localStorage.getItem('isEmailVerified') === 'true';

    if (!isEmailVerified) {
        // Show toast notification
        const toast = document.getElementById('toast');
        toast.classList.remove('hidden');
    }

    // Redirect to verify email page
    document.getElementById('verifyEmailBtn').addEventListener('click', function() {
        // window.location.href = '/verifyEmail'; // Redirect to the verify email page

        fetch('auth/sendVerification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: localStorage.getItem('userEmail') })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message==="Verification Email Succesfully Sent!") {
                alert('Verification email sent successfully.');
            } else {
                alert('Failed to send verification email.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while sending the verification email.');
        });
    });

    // Close the toast notification
    document.getElementById('closeToastBtn').addEventListener('click', function() {
        const toast = document.getElementById('toast');
        toast.classList.add('hidden');
    });
    

    document.addEventListener('DOMContentLoaded', function() {
        const cards = document.querySelectorAll('.card-link');

        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                if (!isEmailVerified) {
                    alert('Please verify your email to access this feature.');
                    return;
                }

                switch(this.id) {
                    case 'reported-incidents-card':
                        window.location.href = 'userIncidentReporting.html';
                        break;
                    case 'send-notifications-card':
                        // Replace with the correct page for sending notifications
                        window.location.href = 'sendNotifications.html';
                        break;
                    case 'location-services-card':
                        // Replace with the correct page for location services
                        window.location.href = 'locationServices.html';
                        break;
                    case 'safety-resources-card':
                        window.location.href = 'userSafetyResources.html';
                        break;
                }
            });
        });
    });
});
