document.addEventListener("DOMContentLoaded", function () {
  //INDEXED DB STUFF TO STORE USER DETAILS THAT ARE STORED IN COOKIES, IN ORDER TO USE THOSE DETAILS IN FIREBASE MESSAGING

  // IndexedDB helper functions

  const DB_NAME = "UserDataDB";
  const STORE_NAME = "userData";
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
              db.createObjectStore(STORE_NAME, { keyPath: "key" });
            }
          };
        });
      } catch (error) {
        console.error("Failed to open IndexedDB:", error);
        throw error;
      }
    }

    async storeData(key, value) {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ key, value });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }

    async getData(key) {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
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
        console.log("User data saved successfully");
      } catch (error) {
        console.error("Failed to save user data:", error);
        throw error;
      }
    }

    async retrieveUserData() {
      try {
        const keys = ["role", "email", "firstname", "lastname"];
        const userData = await Promise.all(
          keys.map(async (key) => [key, await this.getData(key)])
        );
        return Object.fromEntries(userData);
      } catch (error) {
        console.error("Failed to retrieve user data:", error);
        return null;
      }
    }
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Usage
  const userDataStorage = new UserDataStorage();
 

  //Added this so that the cookie data that was stored after login, is stored in indexedDB, that way ,
  //the data can be used by firebase messaging(service worker), since the foreground FCM stuff can use cookies
  async function initializeUserData() {
    try {
      const userData = {
        role: getCookie("role"),
        email: getCookie("email"),
        firstname: getCookie("firstname"),
        lastname: getCookie("lastname"),
      };

      await userDataStorage.saveUserData(userData);
      console.log("User data initialized in IndexedDB");

      // Example of retrieving data
      const storedData = await userDataStorage.retrieveUserData();
      console.log("Retrieved user data:", storedData);
    } catch (error) {
      console.log("Error initializing user data:", error);
    }
  }

  initializeUserData();
  

  //Get references to the cards on the user dashboard
  const reportCard = document.getElementById("report-incident-card");
  const notificationsCard = document.getElementById("view-notifications-card");
  const locationCard = document.getElementById("location-services-card");
  const safetyCard = document.getElementById("safety-resources-card");
  


  reportCard.addEventListener("click", function (event) {
    event.preventDefault();

    window.location.href = "/user/reportIncident";
  });

  notificationsCard.addEventListener("click", function (event) {
    event.preventDefault();

    window.location.href = "/user/emergencyAlerts";
  });

  locationCard.addEventListener("click", function (event) {
    event.preventDefault();

    window.location.href = "/user/campusNavigation";

    // alert("Who is in charge of location again?");
  });

  safetyCard.addEventListener("click", function (event) {
    event.preventDefault();

    window.location.href = "/user/safetyResources";
  });
});
