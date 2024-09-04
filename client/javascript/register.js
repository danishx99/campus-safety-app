document.addEventListener("DOMContentLoaded", function (){

    var signupBtn= document.getElementById("signup-btn");
    var googleBtn= document.getElementById("continue-google-btn");

    let email;
    let phone;
    let account;
    let psw;
    let conf_psw;


    signupBtn.addEventListener("click", function(event){
        console.log("Signup button clicked");

        email= document.getElementById("email").value;
        phone = document.getElementById("phone-num").value;
        account= document.getElementById("acc-type").value;
        psw= document.getElementById("psw").value;
        conf_psw= document.getElementById("conf-psw").value;

        // get account type 

        // check fields are not empty

        if (
            !email ||
            !phone ||
            !account ||
            !psw ||
            !conf_psw ||
            email === "" ||
            phone === "" ||
            account === "" ||
            psw === "" ||
            conf_psw === ""
          ) {
            alert("Not all fields filled in");
            return;
          }

        // input validation
        
        //check format of email- must be wits email
        if (!email.endsWith(".wits.ac.za")) {
            alert("Invalid email format. Please use a Wits email address.");
            return;
        }

        // make sure phone number is valid 10 digit thing
        const phonePattern = /^[0-9]{10}$/; 
        if (!phonePattern.test(phone)) {
        alert("Invalid phone number. Please enter a valid 10-digit phone number.");
        return;
        }

        // make sure strong password
        // mmust contain at least 1 digit, lowercase, Uppercase, & sepcial character from the set [!@#$%^&*]
        const password = psw;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        
        if (!passwordPattern.test(password)) {
            if (!/(?=.*\d)/.test(password)) {
              alert("Password must contain at least one digit.");
            } else if (!/(?=.*[a-z])/.test(password)) {
              alert("Password must contain at least one lowercase letter.");
            } else if (!/(?=.*[A-Z])/.test(password)) {
              alert("Password must contain at least one uppercase letter.");
            } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
              alert("Password must contain at least one special character from the set [!@#$%^&*].");
            } else if (!/.{8,}/.test(password)) {
              alert("Password must be at least 8 characters long.");
            }
            return;
          }
          
          // make sure password == confirmed password
          if (psw !== conf_psw) {
            alert("Passwords do not match.");
            return;
          }

        console.log("Details succesfully captured, time to post!");
        
        
        
    })

    
})