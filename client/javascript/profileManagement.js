const profileForm = document.getElementById('profileForm');
const submitButton = document.getElementById('submitButton');
const editFields = document.getElementById('editFields');
const fileInput = document.getElementById('fileInput');
const cameraButton = document.getElementById('cameraButton');
const avatar = document.getElementById('avatar');

let isEditing = false;
let userId = null;

submitButton.addEventListener('click', () => {
    if (isEditing) {
        saveProfile();
    } else {
        isEditing = true;
        toggleForm();
    }
});

function toggleForm() {
    if (isEditing) {
        submitButton.textContent = 'Save';
        editFields.classList.remove('hidden');
        cameraButton.classList.remove('hidden');
        profileForm.querySelectorAll('input:not(#email)').forEach(input => input.disabled = false);
        
        // Clear password fields
        document.getElementById('password').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        submitButton.textContent = 'Edit Profile';
        editFields.classList.add('hidden');
        cameraButton.classList.add('hidden');
        profileForm.querySelectorAll('input').forEach(input => input.disabled = true);
    }
    // Clear any existing messages
    document.getElementById('messageContainer').classList.add('hidden');
}

function saveProfile() {
    const phone = document.getElementById('cellphone').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showMessage("Passwords do not match", true, 5000);
        return;
    }

    const updateData = { phone };
    if (newPassword) {
        updateData.newPassword = newPassword;
    }

    fetch('/profile/updateUserDetails', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error updating profile: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error('Error updating profile:', data.error);
            showMessage('Failed to update profile. Please try again.', true, 5000);
        } else {
            //console.log('Profile updated successfully:', data);
            showMessage('Profile details updated successfully!', false, 3000);
            isEditing = false;
            toggleForm();
            updateProfileDisplay(data.user);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again.', true, 5000);
    });
}

function updateProfileDisplay(user) {
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('cellphone').value = user.phone || '';
    document.getElementById('email').value = user.email;
    document.getElementById('profileRole').textContent = user.role;
    
    if (user.profilePicture) {
        avatar.src = user.profilePicture;
        localStorage.setItem('userProfilePicture', user.profilePicture);
        updateHeaderProfilePicture(user.profilePicture);
    }

    const dateJoined = new Date(user.createdAt).toISOString().split('T')[0];
    document.querySelector('input[value="2024-09-06"]').value = dateJoined;
}

function logout() {
    //Change address bar to logout
    localStorage.removeItem('userProfilePicture');
    window.location.href = "/auth/logout";
}

// Function to update header profile picture
function updateHeaderProfilePicture(imageUrl) {
    const headerProfilePic = document.querySelector('#header-placeholder img[alt="User Profile"]');
    if (headerProfilePic) {
        headerProfilePic.src = imageUrl;
    }
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
                fetch('/profile/updateUserDetails', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ profilePicture: newImageUrl }),
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error updating profile picture: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        console.error('Error updating profile picture:', data.error);
                        showMessage('Failed to update profile picture. Please try again.', true, 5000);
                    } else {
                        //console.log('Profile picture updated successfully:', data);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('An error occurred while updating the profile picture. Please try again.', true, 5000);
                });
            }
            reader.readAsDataURL(file);
        }
    });

    // Load saved profile picture on page load
    const savedProfilePicture = localStorage.getItem('userProfilePicture');
    if (savedProfilePicture) {
        avatar.src = savedProfilePicture;
        updateHeaderProfilePicture(savedProfilePicture);
    }

    const logoutButton = document.getElementById('logoutButton');

    logoutButton.addEventListener('click', logout);
    

    // Fetch user details and update the profile
    fetch('/profile/getCurrentUser')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                const user = data.user;
                updateProfileDisplay(user);
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
        });

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    function togglePasswordVisibility(inputField, toggleButton) {
        const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
        inputField.setAttribute('type', type);
        toggleButton.querySelector('img').src = type === 'password' ? '../assets/eye-close.png' : '../assets/eye-open.png';
    }

    togglePassword.addEventListener('click', () => togglePasswordVisibility(password, togglePassword));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(confirmPassword, toggleConfirmPassword));
});

function showMessage(message, isError = false, duration = 3000) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = message;
    messageContainer.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    messageContainer.classList.add(
        isError ? 'bg-red-100' : 'bg-green-100',
        isError ? 'text-red-700' : 'text-green-700'
    );
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Set a timer to hide the message
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, duration);
}