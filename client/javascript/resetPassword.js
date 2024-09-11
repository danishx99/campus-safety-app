var resetBtn = document.getElementById('reset-btn');

let new_password;
let conf_password;

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}


resetBtn.addEventListener('click', function (event) {
    console.log('Reset button clicked');

    var alert = document.getElementById("alert");

    showLoader();

    new_password = document.getElementById('psw').value;
    conf_password = document.getElementById('conf-psw').value;

    console.log('New Password:', new_password);
    console.log('Confirm Password:', conf_password);

    // check fields are not empty
    if (
        !new_password ||
        !conf_password ||
        new_password === '' ||
        conf_password === ''
    ) {
        
         
        alert.style.display = "block";
        alert.innerText = "Please fill in all fields";
        hideLoader();
        return;
    }

       
    // make sure password == confirmed password
    if (new_password !== conf_password) {
        alert.style.display = "block";
        alert.innerText ="Passwords do not match.";
        hideLoader();
        return;
    }

  

    const password = new_password;
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    
    if (!passwordPattern.test(password)) {
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        if (!/(?=.*\d)/.test(password)) {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText ="Password must contain at least one digit.";
        } else if (!/(?=.*[a-z])/.test(password)) {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText ="Password must contain at least one lowercase letter.";
        } else if (!/(?=.*[A-Z])/.test(password)) {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText ="Password must contain at least one uppercase letter.";
        } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText ="Password must contain at least one special character from the set [!@#$%^&*].";
        } else if (!/.{8,}/.test(password)) {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText ="Password must be at least 8 characters long.";
        }
        hideLoader();
        return;
      }
   

    //send token 
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // TIME TO POST
    fetch("/auth/resetPassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resetToken: token,
            password: new_password,
        }),
    })
        .then((response) => response.json())
        .then((data) => {

            hideLoader();
            
            if(data.message==="Password reset successfully"){
                alert.style.display = "block";
                alert.style.color = 'green';
                alert.style.backgroundColor = '#ddffdd';
                alert.style.border='green';
                alert.innerText = "Password reset successful, redirecting to login page...";

                // redirect to login page
            setTimeout(() => {
                window.location.href = '/';
            }, 2500);
            }

            else if(data.error){
                console.error("Error resetting password :", data.error);
                alert.style.display = "block";
                alert.innerText = "There was an error resetting your password. Please request a new reset link as this one is invalid or may have expired.";
            }
        })
        .catch((error) => {
            // Handle any errors here
            console.error(error);
            alert.style.display = "block";
            alert.innerText = "An error occured, please try again later: "+error;

            hideLoader();
        });
});