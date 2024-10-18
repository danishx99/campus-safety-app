const profileForm = document.getElementById("profileForm");
const submitButton = document.getElementById("submitButton");
const editFields = document.getElementById("editFields");
const fileInput = document.getElementById("fileInput");
const cameraButton = document.getElementById("cameraButton");
const avatar = document.getElementById("avatar");

let isEditing = false;
let userId = null;

submitButton.addEventListener("click", () => {
  if (isEditing) {
    saveProfile();
  } else {
    isEditing = true;
    toggleForm();
  }
});

function toggleForm() {
  if (isEditing) {
    submitButton.textContent = "Save";
    let googleLogin = getCookie("googleLogin");
    if (googleLogin === "false") {
      editFields.classList.remove("hidden");
    }
    cameraButton.classList.remove("hidden");
    profileForm
      .querySelectorAll("input:not(#email)")
      .forEach((input) => (input.disabled = false));

    // Clear password fields
    document.getElementById("password").value = "";
    document.getElementById("confirmPassword").value = "";
  } else {
    submitButton.textContent = "Edit Profile";
    editFields.classList.add("hidden");
    cameraButton.classList.add("hidden");
    profileForm
      .querySelectorAll("input")
      .forEach((input) => (input.disabled = true));
  }
  // Clear any existing messages
  document.getElementById("messageContainer").classList.add("hidden");
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function cellCheck(cellphone) {
  //Must be 10 digits and must start with a 0
  const phonePattern = /^[0-9]{10}$/;
  if (!phonePattern.test(cellphone)) {
    return false;
  }
  return true;
}

function saveProfile() {
  const phone = document.getElementById("cellphone").value;
  const newPassword = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  let updateData = {};

  if (!cellCheck(phone)) {
    showMessage(
      "Invalid phone number. Please enter a valid 10-digit phone number.",
      true,
      5000
    );
    return;
  }

  updateData.phone = phone;

  if (newPassword || confirmPassword) {
    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", true, 5000);
      return;
    }

    //check if password is strong, showmessage if not
    const password = newPassword;
    const passwordPattern =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordPattern.test(password)) {
      if (!/(?=.*\d)/.test(password)) {
        showMessage("Password must contain at least one digit.", true, 5000);
      } else if (!/(?=.*[a-z])/.test(password)) {
        showMessage(
          "Password must contain at least one lowercase letter.",
          true,
          5000
        );
      } else if (!/(?=.*[A-Z])/.test(password)) {
        showMessage(
          "Password must contain at least one uppercase letter.",
          true,
          5000
        );
      } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
        showMessage(
          "Password must contain at least one special character from the set [!@#$%^&*].",
          true,
          5000
        );
      } else if (!/.{8,}/.test(password)) {
        showMessage("Password must be at least 8 characters long.", true, 5000);
      }
      return;
    }

    updateData.newPassword = newPassword;
  }

  showLoader();

  console.log("we got here");

  fetch("/profile/updateUserDetails", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
    credentials: "include",
  })
    .then((response) => {
      hideLoader();
      if (!response.ok) {
        console.log("Error updating profile");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        console.log("Error updating profile:", data.error);
        showMessage("Failed to update profile. Please try again.", true, 5000);
      } else {
        if (updateData.phone) {
          document.cookie = `phone=${updateData.phone}; path=/`;
        }
        //Update the phone number textbox with the new phone number
        document.getElementById("cellphone").value = updateData.phone;
        //console.log('Profile updated successfully:', data);
        showMessage("Profile details updated successfully!", false, 2000);

        setTimeout(() => {
          isEditing = false;
          toggleForm();
        }, 2000);
      }
    })
    .catch((error) => {
      hideLoader();
      console.error("Error:", error);
      showMessage("An error occurred. Please try again.", true, 5000);
    });
}

function logout() {
  //Change address bar to logout
  localStorage.removeItem("userProfilePicture");
  window.location.href = "/auth/logout";
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function getDatePart(inputString) {
  // Remove the 'j:' part from the string to extract the ISO date part
  const isoString = inputString.split("j:")[1].replace(/"/g, "");

  // Create a Date object from the cleaned ISO string
  const date = new Date(isoString);

  // Extract the date part in YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based in JavaScript
  const day = String(date.getDate()).padStart(2, "0");

  // Return the formatted date
  return `${year}-${month}-${day}`;
}

// Example usage
const input = 'j:"2024-09-16T23:10:07.355Z"';
console.log(getDatePart(input)); // Output: 2024-09-16

document.addEventListener("DOMContentLoaded", function () {
  const avatar = document.getElementById("avatar");
  const cameraButton = document.getElementById("cameraButton");
  const fileInput = document.getElementById("fileInput");

  // Trigger file input when camera button is clicked
  cameraButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Stop event propagation
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newImageUrl = e.target.result;

        // Send the base64 image to the backend
        fetch("/profile/updateUserDetails", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profilePicture: newImageUrl }),
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) {
              console.log("Error updating profile picture");
            }
            return response.json();
          })
          .then((data) => {
            if (data.error) {
              console.error("Error updating profile picture:", data.error);
              showMessage(
                "Failed to update profile picture. Please try again.",
                true,
                5000
              );
            } else {
              console.log(
                "Profile picture updated successfully:",
                data.message
              );
              showMessage("Profile picture updated successfully!", false, 5000);

              // Update profile picture in local storage
              localStorage.setItem("userProfilePicture", newImageUrl);
              avatar.src = newImageUrl;
              document.getElementById("headerProfilePic").src = newImageUrl;
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            showMessage(
              "An error occurred while updating the profile picture. Please try again.",
              true,
              5000
            );
          });
      };
      reader.readAsDataURL(file);
    }
  });

  // Load saved profile picture on page load
  const savedProfilePicture = localStorage.getItem("userProfilePicture");
  if (savedProfilePicture) {
    avatar.src = savedProfilePicture;
  }

  const logoutButton = document.getElementById("logoutButton");

  logoutButton.addEventListener("click", logout);

  // Fetch user details from cookies and populate the form
  let email = getCookie("email");
  let cellphone = getCookie("phone");
  let firstName = getCookie("firstname");
  let lastName = getCookie("lastname");
  let role = getCookie("role");
  let dateJoined = getCookie("joined");

  document.getElementById("email").value = decodeURIComponent(email);
  document.getElementById("profileName").textContent =
    firstName + " " + lastName;
  document.getElementById("profileRole").textContent =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  document.getElementById("cellphone").value = decodeURIComponent(cellphone);
  document.getElementById("dateJoined").value = getDatePart(
    decodeURIComponent(dateJoined)
  );

  // Password visibility toggle
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  function togglePasswordVisibility(inputField, toggleButton) {
    const type =
      inputField.getAttribute("type") === "password" ? "text" : "password";
    inputField.setAttribute("type", type);
    toggleButton.querySelector("img").src =
      type === "password"
        ? "../assets/eye-close.webp"
        : "../assets/eye-open.webp";
  }

  togglePassword.addEventListener("click", () =>
    togglePasswordVisibility(password, togglePassword)
  );
  toggleConfirmPassword.addEventListener("click", () =>
    togglePasswordVisibility(confirmPassword, toggleConfirmPassword)
  );
});

function showMessage(message, isError = false, duration = 5000) {
  const messageContainer = document.getElementById("messageContainer");
  messageContainer.textContent = message;
  messageContainer.classList.remove(
    "hidden",
    "bg-green-100",
    "text-green-700",
    "bg-red-100",
    "text-red-700"
  );
  messageContainer.classList.add(isError ? "bg-red-100" : "bg-green-100");
  messageContainer.classList.add(isError ? "text-red-700" : "text-green-700");
  messageContainer.scrollIntoView({ behavior: "smooth", block: "start" });

  // Set a timer to hide the message
  setTimeout(() => {
    messageContainer.classList.add("hidden");
  }, duration);
}
