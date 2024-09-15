document.addEventListener("DOMContentLoaded", function(){

    var googleBtn= document.getElementById("login-google-btn");
    var alert = document.getElementById("alert");

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBA-red8RszDmGY3YGELrunZQxFmg7r04Y",
        authDomain: "campus-safety-fcm.firebaseapp.com",
        projectId: "campus-safety-fcm",
        storageBucket: "campus-safety-fcm.appspot.com",
        messagingSenderId: "221773083535",
        appId: "1:221773083535:web:0500a94bbb7a9dd6b891fa",
        measurementId: "G-8BZHJT3BRY"
      };
    

    // Initialize Firebase Auth App 
    const authApp=firebase.initializeApp(firebaseConfig);
    

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
                else if(data.success) {
                    alert.style.display = "block";
                    alert.style.color = 'green';
                    alert.style.backgroundColor = '#ddffdd';
                    alert.style.border = 'green';
                    alert.innerText = "Login with Google successful!";
    
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