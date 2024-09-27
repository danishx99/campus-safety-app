document.addEventListener("DOMContentLoaded", async function () {

  //INDEXED DB STUFF TO STORE USER DETAILS THAT ARE STORED IN COOKIES, IN ORDER TO USE THOSE DETAILS IN FIREBASE MESSAGING

  // IndexedDB helper functions

const DB_NAME = 'UserDataDB';
const STORE_NAME = 'userData';
const DB_VERSION = 1;

class UserDataStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return;

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          }
        };
      });
    } catch (error) {
      console.error('Failed to open IndexedDB:', error);
      throw error;
    }
  }

  async storeData(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getData(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }

  async saveUserData(userData) {
    try {
      await Promise.all(
        Object.entries(userData).map(([key, value]) => 
          this.storeData(key, value)
        )
      );
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  async retrieveUserData() {
    try {
      const keys = ['role', 'email', 'firstname', 'lastname'];
      const userData = await Promise.all(
        keys.map(async (key) => [key, await this.getData(key)])
      );
      return Object.fromEntries(userData);
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Usage
const userDataStorage = new UserDataStorage();

async function initializeUserData() {
  try {
    const userData = {
      role: getCookie('role'),
      email: getCookie('email'),
      firstname: getCookie('firstname'),
      lastname: getCookie('lastname')
    };

    await userDataStorage.saveUserData(userData);
    console.log('User data initialized in IndexedDB');

    // Example of retrieving data
    const storedData = await userDataStorage.retrieveUserData();
    console.log('Retrieved user data:', storedData);
  } catch (error) {
    console.log('Error initializing user data:', error);
  }
}

initializeUserData();

  
const headerProfilePic = document.getElementById('headerProfilePic');
const savedProfilePicture = localStorage.getItem('userProfilePicture');

if (savedProfilePicture) {
  headerProfilePic.src = savedProfilePicture;
}

try {
  const response = await fetch('/profile/getCurrentUser', {
    method: 'GET',
    credentials: 'include'
  });
  const data = await response.json();

  if (data.user && data.user.profilePicture) {
    headerProfilePic.src = data.user.profilePicture;

    console.log("I found a profile picture", data.user.profilePicture);
    localStorage.setItem('userProfilePicture', data.user.profilePicture);
  }
} catch (error) {
  console.error('Error fetching user details:', error);
}


  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const verifyEmailBtn = document.getElementById("verifyEmailBtn");
  const closeToastBtn = document.getElementById("closeToastBtn");

  let isEmailVerified = false;

  // Function to show toast with custom message
  function showToast(message, hideButtons = false) {
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    if (hideButtons) {
      verifyEmailBtn.style.display = "none";
      closeToastBtn.style.display = "none";
    } else {
      verifyEmailBtn.style.display = "inline-block";
      closeToastBtn.style.display = "inline-block";
    }
  }

  // Check if the user has verified their email
  fetch("/auth/checkEmailVerification", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      isEmailVerified = data.isVerified;
      if (!isEmailVerified) {
        showToast("Please verify your email to access all features.");
      }
    })
    .catch((error) => {
      console.error("Error checking email verification:", error);
      showToast(
        "An error occurred while checking your email verification status."
      );
    });

  // Send verification email
  verifyEmailBtn.addEventListener("click", function () {
    fetch("auth/sendVerification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Verification Email Successfully Sent!") {
          showToast(
            "Verification email sent successfully. Please check your inbox.",
            true
          );
        } else {
          showToast(
            "An error occurred while sending the verification email.",
            true
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast(
          "An error occurred while sending the verification email.",
          true
        );
      });
  });

  // Close the toast notification
  closeToastBtn.addEventListener("click", function () {
    toast.classList.add("hidden");
  });

  const cards = document.querySelectorAll(".card-link");

  cards.forEach((card) => {
    card.addEventListener("click", function (e) {
      e.preventDefault();

      if (!isEmailVerified) {
        showToast("Please verify your email to access this feature.");
        return;
      }

      // If email is verified, proceed with navigation
      switch (this.id) {
        case "reported-incidents-card":
          window.location.href = "/admin/viewIncidents";
          break;
        case "send-notifications-card":
          window.location.href = "/admin/sendNotifications";
          break;
        case "safety-resources-card":
          window.location.href = "/admin/safetyResources";
          break;
        case "generate-code-card":
          window.location.href = "/admin/generateCode";
          break;
        case "emergency-alerts-card":
          window.location.href = "/admin/emergencyAlerts";
          break;
        case "upcoming-events-card":
          window.location.href = "/admin/getUpcomingEvents";
          break;
      }
    });
  });
});
