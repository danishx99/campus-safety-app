var loginBtn = document.getElementById("login-btn");


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
    // alert.style.display = "block";
    // alert.style.color = 'green';
    // alert.style.backgroundColor = '#ddffdd';
    // alert.style.border='green';
    // alert.innerText = "Login Successfull";

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
      }),
    })
      .then(response => response.json())
      .then(data => {

        console.log(data);
        if(data.error){

          console.error("Error logging in:", data.error);
          alert.style.display = "block";
          alert.style.color = 'red';
          alert.style.backgroundColor = '#ffdddd';
          alert.style.border = 'red';
          alert.innerText = data.error;
        }
        else if (data.success) {
          console.log(data);
    
          alert.style.display = "block";
          alert.style.color = 'green';
          alert.style.backgroundColor = '#ddffdd';
          alert.style.border = 'green';
          alert.innerText = "Logging in user ...";
    
          // Check for data.redirect and redirect
          if (data.redirect) {
            setTimeout(() => {
              window.location.href = "/admin"; // You can use data.redirect.toLowerCase() if necessary
            }, 1000);
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
