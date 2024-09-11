var loginBtn = document.getElementById("login-btn");


let email;
let password;
let rememberMe;
let FCMtoken;

function showLoader(){
    document.getElementById("loader").style.display = "block";
}

function hideLoader(){
    document.getElementById("loader").style.display = "none";
}


loginBtn.addEventListener("click", async function(event){
    console.log("Login button clicked");

    showLoader();

    email= document.getElementById("email").value;
    psw= document.getElementById("password").value;
    rememberMe= document.getElementById("remember").checked;

    if (
        !email ||
        !psw ||
        email === "" ||
        psw === ""
      ) {
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = "Please fill in all fields";
        window.scrollTo(0, 0);
        hideLoader();
        return;
      }
     if(!email.endsWith("@students.wits.ac.za") && !email.endsWith("@wits.ac.za")){
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
      if (error === "No registration token available. Request permission to generate one.") {
          alert.style.display = "block";
          alert.innerText = "Could not generate FCM token. Please enable notifications and try again.";
          window.scrollTo(0, 0);
          hideLoader();
          return;
      } else if (error === "An error occurred while retrieving token.") {
          alert.style.display = "block";
          alert.innerText = "An error occurred while retrieving FCM token needed for registration. Please try again.";
          window.scrollTo(0, 0);
          hideLoader();
          return;
      } else if (error === "Notification permission denied. Request permission to generate FCM token.") {
          alert.style.display = "block";
          alert.innerText = "Notification permission denied. Please enable notifications and try again.";
          window.scrollTo(0, 0);
          hideLoader();
          return;
      } else if (error === "Service Worker registration failed.") {
          alert.style.display = "block";
          alert.innerText = "There was an error registering the service worker needed for notifications. Please try again.";
          window.scrollTo(0, 0);
          hideLoader();
          return;
      } else if (error === "Service worker not supported in this browser.") {
          alert.style.display = "block";
          alert.innerText = "Service worker not supported in this browser. Please try again.";
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
      .then(response => response.json())
      .then(data => {

        hideLoader();

        console.log(data);
        if(data.error){

          console.error("Error logging in:", data.error);
          alert.style.display = "block";
          alert.style.color = 'red';
          alert.style.backgroundColor = '#ffdddd';
          alert.style.border = 'red';
          alert.innerText = data.error;

          window.scrollTo(0, 0);
        }

        else if (data.success) {
          console.log(data);
    
          alert.style.display = "block";
          alert.style.color = 'green';
          alert.style.backgroundColor = '#ddffdd';
          alert.style.border = 'green';
          alert.innerText = "Login successful! Redirecting to dashboard...";

          window.scrollTo(0, 0);
    
          // Check for data.redirect and redirect
          if (data.redirect) {

            if(data.redirect === "admin"){
              setTimeout(() => {
                window.location.href = "/admin";
              }, 1000);
            } else if(data.redirect === "student"){
              setTimeout(() => {
                window.location.href = "/user";
              }, 1000);
            } else if(data.redirect === "staff"){
              setTimeout(() => {
                window.location.href = "/user";
              }, 1000);
            }
          }
        } else {
          // Handle case when login fails but no exception was thrown
          console.error("Login failed:", data);
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert.style.display = "block";
        alert.style.color = 'red';
        alert.style.backgroundColor = '#ffdddd';
        alert.style.border = 'red';
        alert.innerText = `Error: ${error.message}`;
      });
    
})
