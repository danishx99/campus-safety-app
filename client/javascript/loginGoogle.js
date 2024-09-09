document.addEventListener("DOMContentLoaded", function(){

    var googleBtn= document.getElementById("login-google-btn");

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyCKYgVkEWA40OPzRDWGnwkBIDq4-ozQT_4",
        authDomain: "campus-safety-53fa9.firebaseapp.com",
        projectId: "campus-safety-53fa9",
        storageBucket: "campus-safety-53fa9.appspot.com",
        messagingSenderId: "637676540009",
        appId: "1:637676540009:web:9c595c9b61161ca062d2f8",
        measurementId: "G-TDKPZ0ZSC0"
    };

    // Initialize Firebase
    // initializeApp(firebaseConfig);
    

    googleBtn.addEventListener("click", function(event){

        event.preventDefault();

        alert("Login with Google btn clicked");


       
    })
    

})