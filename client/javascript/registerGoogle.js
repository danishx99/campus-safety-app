document.addEventListener("DOMContentLoaded", function () {

    var continueGoogle = document.getElementById("continue-google-btn");
    var proceedGoogle = document.getElementById("proceed-google-btn"); // button on the sub-page
  
    var alert = document.getElementById("alert");
    var displayCode = document.getElementById("hidden-admin-google");
  
    var form1 = document.getElementById("form-p1");
    var form2 = document.getElementById("form-p2");
  
    // Firebase configuration for Auth
    // const authFirebaseConfig = {
    //   apiKey: "AIzaSyCKYgVkEWA40OPzRDWGnwkBIDq4-ozQT_4",
    //   authDomain: "campus-safety-53fa9.firebaseapp.com",
    //   projectId: "campus-safety-53fa9",
    //   storageBucket: "campus-safety-53fa9.appspot.com",
    //   messagingSenderId: "637676540009",
    //   appId: "1:637676540009:web:9c595c9b61161ca062d2f8",
    //   measurementId: "G-TDKPZ0ZSC0"
    // };

    const firebaseConfig = {
      apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
      authDomain: "campus-safety-fcm.firebaseapp.com",
      projectId: "campus-safety-fcm",
      storageBucket: "campus-safety-fcm.appspot.com",
      messagingSenderId: "221773083535",
      appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
      measurementId: "G-8BZHJT3BRY"
    };
  
    var account;
    let code;

    document.getElementById("acc-type2").addEventListener("change", function() {
      if (this.value === "0") {
          displayCode.className = "space-y-2";
          displayCode.style.display = ""; // Ensure the element is visible
          account= this.value;
      } else {
          displayCode.style.display = "none";
          account= this.value;
      }
      console.log("Account value inside event listener:", account);
  });

  
    // // get account type and code of admin 
    // account = document.getElementById("acc-type2").value;
    code = document.getElementById("code").value;
  
    // Initialize Firebase Auth App (using the named app "authApp")
    // const authApp = firebase.initializeApp(authFirebaseConfig, "authApp");
    const authApp=firebase.initializeApp(firebaseConfig);
  
    continueGoogle.addEventListener("click", function (event) {
      event.preventDefault();
      form1.className = "hidden";
      form2.className = "block p-2 space-y-6";
    });
  
    proceedGoogle.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("button clickky");
      console.log("Account value outside event listener:", account);

      // Check if the account has a value
      if (!account) {
        alert.style.display = "block";
        alert.style.color = 'red';
        alert.style.backgroundColor = '#ffdddd';
        alert.style.border = 'red';
        alert.innerText = "Please select an account type.";
        return; // Stop further execution
      }
  
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

          if (!email.endsWith("@students.wits.ac.za") && !email.endsWith("@wits.ac.za")) {
            alert.style.display = "block";
            alert.innerText = "Invalid email format. Please use a Wits email address.";
            //Scroll to top of page
            window.scrollTo(0, 0);
            hideLoader();
            return;
        }
  
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
  