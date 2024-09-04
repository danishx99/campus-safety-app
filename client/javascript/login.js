var loginBtn = document.getElementById("login-btn");
var googleBtn = document.getElementById("continue-google-btn");

let email;
let password;
let rememberMe;

loginBtn.addEventListener("click", function(event){
    console.log("Login button clicked");

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
        return;
      }
     if(!email.endsWith("@students.wits.ac.za") && !email.endsWith("@wits.ac.za")){
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = "Please enter a valid Wits email address";
        return;
     }

     //Validation complete, time to POST to the server
    console.log(email);
    var alert = document.getElementById("alert");
    alert.style.display = "block";
    alert.style.color = 'green';
    alert.style.backgroundColor = '#ddffdd';
    alert.style.border='green';
    alert.innerText = "Login Successfull";

    //POST to server
    /*fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: psw,
          rememberMe: rememberMe,
        }),
      })
        .then((response) => {
          if (response.status === 200) {
            console.log("Login successful");
            window.location.href = "";
          } else {
            console.log("Login failed");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });*/

    
})
