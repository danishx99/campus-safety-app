document.addEventListener("DOMContentLoaded", function(){

    var googleBtn= document.getElementById("login-google-btn");
    var alert = document.getElementById("alert");

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const authFirebaseConfig = {
        apiKey: "AIzaSyCKYgVkEWA40OPzRDWGnwkBIDq4-ozQT_4",
        authDomain: "campus-safety-53fa9.firebaseapp.com",
        projectId: "campus-safety-53fa9",
        storageBucket: "campus-safety-53fa9.appspot.com",
        messagingSenderId: "637676540009",
        appId: "1:637676540009:web:9c595c9b61161ca062d2f8",
        measurementId: "G-TDKPZ0ZSC0"
    };

    // Initialize Firebase Auth App (using the named app "authApp")
    const authApp = firebase.initializeApp(authFirebaseConfig, "authApp");
    

    googleBtn.addEventListener("click", function(event){

        event.preventDefault();

        const auth = firebase.auth(authApp);  // Use the named app for auth services
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
                    alert.innerText = "Login with Google successful!";
    
                    // redirect to login page
                    setTimeout(() => {
                    window.location.href = "/admin";
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


       
    })
    

})