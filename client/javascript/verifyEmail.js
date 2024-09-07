document.addEventListener("DOMContentLoaded", function(){

    // Extract token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    var alert = document.getElementById("alert");

    let email;
    email= document.getElementById("email").value;

    

    // Send token to verify endpoint
    fetch("/auth/verifyEmail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: token,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            
            if(data.message==="Email verified successfully!"){
                alert.style.display = "block";
                alert.style.color = 'green';
                alert.style.backgroundColor = '#ddffdd';
                alert.style.border='green';
                alert.innerText = "Email verified successfully!";

                // redirect to login page
            setTimeout(() => {
                window.location.href = '/';
            }, 2500);
            }

            else if(data.error){
                console.error("Error verifying email :", data.error);
                alert.style.display = "block";
                alert.style.color = 'red';
                alert.style.backgroundColor = '#ffdddd';
                alert.style.border = 'red';
                alert.innerText = data.error;
            }
        })
        .catch((error) => {
            // Handle any errors here
            console.error(error);
        });

    var resendBtn = document.getElementById("resend-btn");

    resendBtn.addEventListener("click", function(event){
        console.log("Resend button clicked");

        if(!email || email===""){
            alert.style.display = "block";
            alert.innerText = "Please fill in all fields";
            return;
        }
    
        //check format of email- must be wits email
        if (!email.endsWith(".wits.ac.za")) {
            alert.style.display = "block";
            alert.innerText = "Invalid email format. Please use a Wits email address.";
            return;
        }

        fetch("/auth/ResendVerificationEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            if(data.message ==="Verification email resent successfully!"){
                alert.style.display = "block";
                alert.style.color = 'green';
                alert.style.backgroundColor = '#ddffdd';
                alert.style.border='green';
                alert.innerText = "Verification email resent successfully!";
            }
            else if(data.error){
                console.error("Error with Resending Verification Email :", data.error);
                alert.style.display = "block";
                alert.style.color = 'red';
                alert.style.backgroundColor = '#ffdddd';
                alert.style.border = 'red';
                alert.innerText = data.error;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
        
    })


})