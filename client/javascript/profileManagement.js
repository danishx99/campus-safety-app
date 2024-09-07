const profileForm = document.getElementById('profileForm');
const submitButton = document.getElementById('submitButton');
const editFields = document.getElementById('editFields');
const fileInput = document.getElementById('fileInput');
const cameraButton = document.getElementById('cameraButton');
const avatar = document.getElementById('avatar');

let isEditing = false;

submitButton.addEventListener('click', () => {
    if (isEditing) {
        // Save logic
        console.log('Profile saved.');
        isEditing = false;
        toggleForm();
    } else {
        isEditing = true;
        toggleForm();
    }
});

function toggleForm() {
    if (isEditing) {
        submitButton.textContent = 'Save';
        editFields.classList.remove('hidden');
        cameraButton.classList.remove('hidden'); // Show camera button when editing
        profileForm.querySelectorAll('input').forEach(input => input.disabled = false);
    } else {
        submitButton.textContent = 'Edit Profile';
        editFields.classList.add('hidden');
        cameraButton.classList.add('hidden'); // Hide camera button when not editing
        profileForm.querySelectorAll('input').forEach(input => input.disabled = true);
        // Keep email and cellphone disabled even in edit mode
        document.getElementById('email').disabled = true;
        document.getElementById('cellphone').disabled = true;
    }
}

function logout() {
    fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Logged out successfully") {
            window.location.href = '/';
        } else {
            console.error('Logout failed:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const avatar = document.getElementById('avatar');
    const cameraButton = document.getElementById('cameraButton');
    const fileInput = document.getElementById('fileInput');

    // Trigger file input when camera button is clicked
    cameraButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default action
        e.stopPropagation(); // Stop event propagation
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newImageUrl = e.target.result;
                avatar.src = newImageUrl;

                // Update profile picture in local storage
                localStorage.setItem('userProfilePicture', newImageUrl);

                // Update header profile picture
                updateHeaderProfilePicture(newImageUrl);

                // Send the base64 image to the backend
                fetch('/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ profilePicture: newImageUrl }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error updating profile picture:', data.error);
                    } else {
                        console.log('Profile picture updated successfully:', data);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
            reader.readAsDataURL(file);
        }
    });

    // Function to update header profile picture
    function updateHeaderProfilePicture(imageUrl) {
        const headerProfilePic = document.querySelector('#header-placeholder img[alt="User Profile"]');
        if (headerProfilePic) {
            headerProfilePic.src = imageUrl;
        }
    }

    // Load saved profile picture on page load
    const savedProfilePicture = localStorage.getItem('userProfilePicture');
    if (savedProfilePicture) {
        avatar.src = savedProfilePicture;
        updateHeaderProfilePicture(savedProfilePicture);
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});