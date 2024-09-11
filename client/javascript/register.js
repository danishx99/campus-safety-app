document.addEventListener("DOMContentLoaded", function (){

    var signupBtn= document.getElementById("signup-btn");
    var alert = document.getElementById("alert");
    var code = document.getElementById("hidden-admin-code");

    let email;
    let phone;
    let account;
    let psw;
    let conf_psw;
    let firstName;
    let lastName;
    let FCMtoken;

    function showLoader(){
        document.getElementById("loader").style.display = "block";
    }

    function hideLoader(){
        document.getElementById("loader").style.display = "none";
    }

    document.getElementById("acc-type").addEventListener("change", function() {
        if (this.value === "0") {
            code.className = "space-y-2";
            code.style.display = ""; // Ensure the element is visible
        } else {
            code.style.display = "none";
        }
    });



    signupBtn.addEventListener("click", async function(event){

        //Remove any previous alerts
        alert.style.display = "none";

        // Prevent the default form submission
        event.preventDefault();

        // Show the loader after initial signUp click
        showLoader();
       

        email= document.getElementById("email").value;
        phone = document.getElementById("phone-num").value;
        account= document.getElementById("acc-type").value;
        psw= document.getElementById("psw").value;
        conf_psw= document.getElementById("conf-psw").value;
        firstName = document.getElementById("first-name").value;
        lastName = document.getElementById("last-name").value;

       
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
          lastName === ""
        ) {
          alert.style.display = "block";
          alert.innerText = "Please fill in all fields";
          //Scroll to top of page
          window.scrollTo(0, 0);
          hideLoader();
          return;
        }

        // input validation
        //check format of email- must be wits email
        if (!email.endsWith(".wits.ac.za")) {
            alert.style.display = "block";
            alert.innerText = "Invalid email format. Please use a Wits email address.";
            //Scroll to top of page
            window.scrollTo(0, 0);
            hideLoader();
            return;
        }

        // make sure phone number is valid 10 digit thing
        const phonePattern = /^[0-9]{10}$/; 
        if (!phonePattern.test(phone)) {
            alert.style.display = "block";
            alert.innerText = "Invalid phone number. Please enter a valid 10-digit phone number.";
            //Scroll to top of page
            window.scrollTo(0, 0);
            hideLoader();
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
            //Scroll to top of page
            window.scrollTo(0, 0);
            hideLoader();
            return;
          }
          
        // make sure password == confirmed password
        if (psw !== conf_psw) {
        alert.style.display = "block";
        alert.innerText = "Passwords do not match.";
        //Scroll to top of page
        window.scrollTo(0, 0);
        hideLoader();
        return;
        }

        
        try {
            // Try to initialize Firebase FCM and await the result
            let result = await initFireBaseFCM();
            console.log("FCM TOKEN RESULT FROM PROMISE:", result);
            // Handle the successful case (this is when the token is resolved properly)
            FCMtoken = result;
        } catch (error) {
             console.log("FCM TOKEN ERROR FROM PROMISE:", error);
            // Handle different rejection scenarios
            if (error === "No registration token available. Request permission to generate one.") {
                alert.style.display = "block";
                alert.innerText = "Could not generate FCM token. Please enable notifications and try again.";
                window.scrollTo(0, 0);
                hideLoader();
                return;
            } else if (error === "An error occurred while retrieving token.") {
                alert.style.display = "block";
                alert.innerText = "An error occurred while retrieving FCM token needed for registration. Please try again.";
                window.scrollTo(0, 0);
                hideLoader();
                return;
            } else if (error === "Notification permission denied. Request permission to generate FCM token.") {
                alert.style.display = "block";
                alert.innerText = "Notification permission denied. Please enable notifications and try again.";
                window.scrollTo(0, 0);
                hideLoader();
                return;
            } else if (error === "Service Worker registration failed.") {
                alert.style.display = "block";
                alert.innerText = "There was an error registering the service worker needed for notifications. Please try again.";
                window.scrollTo(0, 0);
                hideLoader();
                return;
            } else if (error === "Service worker not supported in this browser.") {
                alert.style.display = "block";
                alert.innerText = "Service worker not supported in this browser. Please try again.";
                window.scrollTo(0, 0);
                hideLoader();
                return;
            } else {
                alert.style.display = "block";
                alert.innerText = "An unexpected error occurred. Please try again.";
                window.scrollTo(0, 0);
                hideLoader();
                return;
            }
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
                lastName: lastName,
                FCMtoken: FCMtoken
            })
        })
            .then(response => response.json())
            .then(data => {
                hideLoader();

                // Handle the response data here
                if (data.message ==="Registration successful!") {

                    alert.style.display = "block";
                    alert.style.color = 'green';
                    alert.style.backgroundColor = '#ddffdd';
                    alert.style.border='green';
                    alert.innerText = "Registration successful! Redirecting to login page...";

                    //Scroll to top of page
                    window.scrollTo(0, 0);

                

                // redirect to login page
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
                console.log(data);
                }
                else if(data.error){
                    console.error("Error registering user :", data.error);
                    alert.style.display = "block";
                    alert.style.color = 'red';
                    alert.style.backgroundColor = '#ffdddd';
                    alert.style.border = 'red';
                    alert.innerText = data.error;
                    //Scroll to top of page
                    window.scrollTo(0, 0);
                    
                }
            })
            .catch(error => {
                // Handle any errors here
                console.error(error);
            }); 
    })

    
})