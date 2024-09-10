document.addEventListener("DOMContentLoaded", function(){

    var continueGoogle= document.getElementById("continue-google-btn");
    var proceedGoogle = document.getElementById("proceed-google-btn");

    var form1 = document.getElementById("form-p1");
    var form2 = document.getElementById("form-p2");

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

    continueGoogle.addEventListener("click", function (event) {
        event.preventDefault();
        form1.className = "hidden";
        form2.className = "block p-2 space-y-6";
        //submitButton.style.display = "none";
        //registerWithGoogle.style.display = "flex";
    });
    

    proceedGoogle.addEventListener("click", function(event){

        event.preventDefault();

        alert("Sign up with Google btn clicked");
       
    });
    

})