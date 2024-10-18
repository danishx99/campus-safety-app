var loginBtn = document.getElementById("login-btn");

let email;
let password;
let rememberMe;
let FCMtoken;

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function showResendEmailLoader() {
  document.getElementById("resendEmailLoader").style.display = "block";
}

function hideResendEmailLoader() {
  document.getElementById("resendEmailLoader").style.display = "none";
}

loginBtn.addEventListener("click", async function (event) {
  event.preventDefault();

  console.log("Login button clicked");

  showLoader();

  email = document.getElementById("email").value;
  psw = document.getElementById("password").value;
  rememberMe = document.getElementById("remember").checked;

  if (!email || !psw || email === "" || psw === "") {
    var alert = document.getElementById("alert");
    alert.style.display = "block";
    alert.innerText = "Please fill in all fields";
    window.scrollTo(0, 0);
    hideLoader();
    return;
  }
  if (
    !email.endsWith("@students.wits.ac.za") &&
    !email.endsWith("@wits.ac.za")
  ) {
    var alert = document.getElementById("alert");
    alert.style.display = "block";
    alert.innerText = "Please enter a valid Wits email address";
    window.scrollTo(0, 0);
    hideLoader();
    return;
  }

  var alert = document.getElementById("alert");

  try {
    // Try to initialize Firebase FCM and await the result
    let result = await initFireBaseFCM();
    console.log("FCM TOKEN RESULT FROM PROMISE:", result);
    // Handle the successful case (this is when the token is resolved properly)
    FCMtoken = result;

    console.log("FCM TOKEN FROM LOGIN:", FCMtoken);
  } catch (error) {
    console.log("FCM TOKEN ERROR FROM PROMISE:", error);
    // Handle different rejection scenarios
    if (
      error ===
      "No registration token available. Request permission to generate one."
    ) {
      alert.style.display = "block";
      alert.innerText =
        "Could not generate FCM token. Please enable notifications and try again.";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    } else if (error === "An error occurred while retrieving token.") {
      alert.style.display = "block";
      alert.innerText =
        "An error occurred while retrieving FCM token needed for registration. Please try again.";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    } else if (
      error ===
      "Notification permission denied. Request permission to generate FCM token."
    ) {
      alert.style.display = "block";
      alert.innerText =
        "Notification permission denied. Please enable notifications and try again.";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    } else if (error === "Service Worker registration failed.") {
      alert.style.display = "block";
      alert.innerText =
        "There was an error registering the service worker needed for notifications. Please try again.";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    } else if (error === "Service worker not supported in this browser.") {
      alert.style.display = "block";
      alert.innerText =
        "Service worker not supported in this browser. Please try again.";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    } else {
      alert.style.display = "block";
      alert.innerText = "An unexpected error occurred. Please try again.";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    }
  }

  //POST to server
  fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: psw,
      rememberMe: rememberMe,
      FCMtoken: FCMtoken,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      hideLoader();

      console.log(data);
      if (data.error && data.error === "Your email is not verified") {
        console.log("Error logging in:", data.error);
        alert.style.display = "block";
        alert.style.color = "#4187CB";
        alert.style.backgroundColor = "white";
        alert.style.borderColor = "#015EB8";
        alert.innerHTML = `Your email is not verified. Please check your inbox for the verification email or <span id="resendEmailBtn" class="font-bold underline text-blue-600 hover:text-blue-800 cursor-pointer">request a new one</span>.`;

        //Get the link to the resend email button and add event listener
        var resendEmailBtn = document.getElementById("resendEmailBtn");

        const email = data.email;

        resendEmailBtn.addEventListener("click", function (event) {
          event.preventDefault();

          //Show resend email loader
          showResendEmailLoader();

          //POST to server
          fetch("/auth/sendVerification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);

              hideResendEmailLoader();

              if (data.success) {
                alert.style.display = "block";
                alert.style.color = "#4187CB";
                alert.style.backgroundColor = "white";
                alert.style.borderColor = "#015EB8";
                alert.innerText =
                  "Verification email sent successfully. Please check your inbox.";

                window.scrollTo(0, 0);
              } else if (data.error) {
                alert.style.display = "block";
                alert.style.color = "#4187CB";
                alert.style.backgroundColor = "white";
                alert.style.borderColor = "#015EB8";
                alert.innerText = data.error;
                window.scrollTo(0, 0);
              }
            })
            .catch((error) => {
              console.log("Error resending email:", error);
              alert.style.display = "block";
              alert.style.color = "#4187CB";
              alert.style.backgroundColor = "white";
              alert.style.borderColor = "#015EB8";
              alert.innerText = `An error occurred while resending the verification email. Please try again.`;

              hideResendEmailLoader();
            });
        });

        window.scrollTo(0, 0);
      }else if(data.error && data.error === "User registered with Google"){
        console.log("This was caledddddddddddddddddd")
        console.log("Error logging in:", "You registered with Google. Please use google to sign in, or contact us if you want to create a password.");
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText = "You registered with Google. Please use google to sign in, or contact us if you want to create a password.";
        window.scrollTo(0,0);
      } else if (data.success) {
        console.log(data);
        alert.style.display = "block";
        alert.style.color = "green";
        alert.style.backgroundColor = "#ddffdd";
        alert.style.border = "green";
        alert.innerText = "Login successful! Redirecting to dashboard...";

        window.scrollTo(0, 0);

        // //Set the user's profile pic in localstorage in local storage
        localStorage.setItem("userProfilePicture", data.profilePicture);
        
        // Check for data.redirect and redirect
        // if (data.redirect) {

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
      } else {
        // Handle case when login fails but no exception was thrown
        console.error("Login failed:", data);
      }
    })
    .catch((error) => {
      console.log("Error logging in:", error);
      alert.style.display = "block";
      alert.style.color = "red";
      alert.style.backgroundColor = "#ffdddd";
      alert.style.border = "red";
      alert.innerText = `An error occurred while logging in. Please try again.`;

      hideLoader();
    });
});
