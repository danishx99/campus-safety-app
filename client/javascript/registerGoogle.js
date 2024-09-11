document.addEventListener("DOMContentLoaded", function () {

    var continueGoogle = document.getElementById("continue-google-btn");
    var proceedGoogle = document.getElementById("proceed-google-btn"); // button on the sub-page
  
    var alert = document.getElementById("alert");
  
    var form1 = document.getElementById("form-p1");
    var form2 = document.getElementById("form-p2");
  
    // Firebase configuration for Auth
    const authFirebaseConfig = {
      apiKey: "AIzaSyCKYgVkEWA40OPzRDWGnwkBIDq4-ozQT_4",
      authDomain: "campus-safety-53fa9.firebaseapp.com",
      projectId: "campus-safety-53fa9",
      storageBucket: "campus-safety-53fa9.appspot.com",
      messagingSenderId: "637676540009",
      appId: "1:637676540009:web:9c595c9b61161ca062d2f8",
      measurementId: "G-TDKPZ0ZSC0"
    };
  
    let account;
    let code;
  
    account = document.getElementById("acc-type").value;
    code = document.getElementById("code").value;
  
    // Initialize Firebase Auth App (using the named app "authApp")
    const authApp = firebase.initializeApp(authFirebaseConfig, "authApp");
  
    continueGoogle.addEventListener("click", function (event) {
      event.preventDefault();
      form1.className = "hidden";
      form2.className = "block p-2 space-y-6";
    });
  
    proceedGoogle.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("button clickky");
  
      const auth = firebase.auth(authApp);  // Use the named app for auth services
      const provider = new firebase.auth.GoogleAuthProvider();
  
      auth
        .signInWithPopup(provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          console.log(result.user);
          
          var email = user.email;
          var phone = user.phoneNumber;
          var fname = user.displayName.split(" ")[0];
          var lname = user.displayName.split(" ")[1];
  
          //show loader while waiting for response
          // var loader = document.getElementById("loaderGoogle");
          // loader.style.display = "flex";
  
          fetch("/auth/googleRegister", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: fname,
              surname: lname,
              email,
              phone,
              account,
            }),
          })
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              console.log(data);
  
              if (data.error) {
                console.error("Error registering user :", data.error);
                alert.style.display = "block";
                alert.style.color = 'red';
                alert.style.backgroundColor = '#ffdddd';
                alert.style.border = 'red';
                alert.innerText = data.error;
              }
              else {
                alert.style.display = "block";
                alert.style.color = 'green';
                alert.style.backgroundColor = '#ddffdd';
                alert.style.border = 'green';
                alert.innerText = "Sign up with Google successful!";
  
                // redirect to login page
                setTimeout(() => {
                  window.location.href = "/";
                }, 3000);
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
  