document.addEventListener("DOMContentLoaded", function (){

    var signupBtn= document.getElementById("signup-btn");
    var googleBtn= document.getElementById("continue-google-btn");
    var alert = document.getElementById("alert");

    let email;
    let phone;
    let account;
    let psw;
    let conf_psw;
    let firstName;
    let lastName;

    signupBtn.addEventListener("click", function(event){
        console.log("Signup button clicked");

        email= document.getElementById("email").value;
        phone = document.getElementById("phone-num").value;
        account= document.getElementById("acc-type").value;
        psw= document.getElementById("psw").value;
        conf_psw= document.getElementById("conf-psw").value;
        firstName = document.getElementById("first-name").value;
        lastName = document.getElementById("last-name").value;

        // get account type 

        // check fields are not empty

        if (
            !email ||
            !phone ||
            !account ||
            !psw ||
            !conf_psw ||
            !firstName ||
            !lastName ||
            email === "" ||
            phone === "" ||
            account === "" ||
            psw === "" ||
            conf_psw === "" ||
            firstName === "" ||
            lastName===""
          ) {
            alert.style.display = "block";
            alert.innerText = "Please fill in all fields";
            return;
          }

        // input validation
        
        //check format of email- must be wits email
        if (!email.endsWith(".wits.ac.za")) {
            alert.style.display = "block";
            alert.innerText = "Invalid email format. Please use a Wits email address.";
            return;
        }

        // make sure phone number is valid 10 digit thing
        const phonePattern = /^[0-9]{10}$/; 
        if (!phonePattern.test(phone)) {
            alert.style.display = "block";
            alert.innerText = "Invalid phone number. Please enter a valid 10-digit phone number.";
        return;
        }

        // make sure strong password
        // mmust contain at least 1 digit, lowercase, Uppercase, & sepcial character from the set [!@#$%^&*]
        const password = psw;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        
        if (!passwordPattern.test(password)) {
            if (!/(?=.*\d)/.test(password)) {
                alert.style.display = "block";
                alert.innerText = "Password must contain at least one digit.";
            } else if (!/(?=.*[a-z])/.test(password)) {
                alert.style.display = "block";
                alert.innerText = "Password must contain at least one lowercase letter.";
            } else if (!/(?=.*[A-Z])/.test(password)) {
                alert.style.display = "block";
                alert.innerText = "Password must contain at least one uppercase letter.";
            } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
                alert.style.display = "block";
                alert.innerText = "Password must contain at least one special character from the set [!@#$%^&*].";
            } else if (!/.{8,}/.test(password)) {
                alert.style.display = "block";
                alert.innerText = "Password must be at least 8 characters long.";
            }
            return;
          }
          
        // make sure password == confirmed password
        if (psw !== conf_psw) {
        alert.style.display = "block";
        alert.innerText = "Passwords do not match.";
        return;
        }

        // validation passed, now post to backend
        console.log("Details succesfully captured, time to post!");

        fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                phone: phone,
                account: account,
                password: psw,
                firstName: firstName,
                lastName: lastName
            })
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response data here
                if (data.message ==="Registration successful! Please verify your email.") {
                    
                    alert.style.display = "block";
                    alert.style.color = 'green';
                    alert.style.backgroundColor = '#ddffdd';
                    alert.style.border='green';
                    alert.innerText = "Registration successful! Please verify your email.";

                // // redirect to login page
                // setTimeout(() => {
                //     window.location.href = "/";
                // }, 3000);
                console.log(data);
                }
                
            })
            .catch(error => {
                // Handle any errors here
                console.error(error);
            }); 
    })

    
})