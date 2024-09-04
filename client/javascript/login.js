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
      /*if(rememberMe){
        console.log("Remember me checked");
      }*/
     if(!email.endsWith("@students.wits.ac.za") && !email.endsWith("@wits.ac.za")){
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = "Please enter a valid Wits email address";
        return;
     }

    console.log(email);
    
})
