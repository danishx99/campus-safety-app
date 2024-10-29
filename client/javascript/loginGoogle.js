document.addEventListener("DOMContentLoaded", function () {
  var googleBtn = document.getElementById("login-google-btn");
  var alert = document.getElementById("alert");

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
    authDomain: "campus-safety-fcm.firebaseapp.com",
    projectId: "campus-safety-fcm",
    storageBucket: "campus-safety-fcm.appspot.com",
    messagingSenderId: "221773083535",
    appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
    measurementId: "G-8BZHJT3BRY",
  };

  function showLoaderGoogle() {
    document.getElementById("loader-google").style.display = "block";
  }

  function hideLoaderGoogle() {
    document.getElementById("loader-google").style.display = "none";
  }

  // Initialize Firebase Auth App
  const authApp = firebase.initializeApp(firebaseConfig);

  googleBtn.addEventListener("click", async function (event) {
    //Show loader while fcm token is being generated
    showLoaderGoogle();

    let FCMtoken;

    try {
      // Try to initialize Firebase FCM and await the result
      let result = await initFireBaseFCM();
      console.log("FCM TOKEN RESULT FROM PROMISE:", result);
      // Handle the successful case (this is when the token is resolved properly)
      FCMtoken = result;

      //Hide loader after FCM token is generated
      hideLoaderGoogle();
    } catch (error) {
      console.log("FCM TOKEN ERROR FROM PROMISE:", error);
      hideLoaderGoogle();
      // Handle different rejection scenarios
      if (
        error ===
        "No registration token available. Request permission to generate one."
      ) {
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText =
          "Could not generate FCM token. Please enable notifications and try again.";
        window.scrollTo(0, 0);

        return;
      } else if (error === "An error occurred while retrieving token.") {
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText =
          "An error occurred while retrieving FCM token needed for registration. Please try again.";
        window.scrollTo(0, 0);

        return;
      } else if (
        error ===
        "Notification permission denied. Request permission to generate FCM token."
      ) {
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText =
          "Notification permission denied. Please enable notifications and try again.";
        window.scrollTo(0, 0);

        return;
      } else if (error === "Service Worker registration failed.") {
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText =
          "There was an error registering the service worker needed for notifications. Please try again.";
        window.scrollTo(0, 0);

        return;
      } else if (error === "Service worker not supported in this browser.") {
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText =
          "Service worker not supported in this browser. Please try again.";
        window.scrollTo(0, 0);

        return;
      } else {
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText = "An unexpected error occurred. Please try again.";
        window.scrollTo(0, 0);

        return;
      }
    }

    event.preventDefault();

    const auth = firebase.auth(authApp); // Use the named app for auth services
    const provider = new firebase.auth.GoogleAuthProvider();

    auth
      .signInWithPopup(provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;

        var user = result.user;
        var email = user.email;
        //show loader while waiting for response
        // var loader = document.getElementById("loaderGoogle");
        // loader.style.display = "flex";

        fetch("/auth/googleLogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            FCMtoken,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);

            if (data.error) {
              console.error("Error logging in user :", data.error);
              alert.style.display = "block";
              alert.style.color = "red";
              alert.style.backgroundColor = "#ffdddd";
              alert.style.border = "red";
              alert.innerText = data.error;
            } else if (data.success) {
              alert.style.display = "block";
              alert.style.color = "green";
              alert.style.backgroundColor = "#ddffdd";
              alert.style.border = "green";
              alert.innerText = "Login with Google successful!";

              window.scrollTo(0, 0);

              // //Set the user's profile pic in localstorage in local storage
              localStorage.setItem("userProfilePicture", data.profilePicture);

              // Check for data.redirect and redirect
              if (data.redirect) {
                if (data.redirect === "admin") {
                  setTimeout(() => {
                    window.location.href = "/admin";
                  }, 1000);
                } else if (data.redirect === "student") {
                  setTimeout(() => {
                    window.location.href = "/user";
                  }, 1000);
                } else if (data.redirect === "staff") {
                  setTimeout(() => {
                    window.location.href = "/user";
                  }, 1000);
                }
              }
            }
          })
          .catch((error) => {
            console.log("Error:", error);
            // loader.style.display = "none";
          });
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(error);
      });
  });
});
