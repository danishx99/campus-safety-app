document.addEventListener("DOMContentLoaded", function(){

    var resendBtn = document.getElementById("resend-btn");

    resendBtn.addEventListener("click", function(event){
        console.log("Resend button clicked");

        fetch("/auth/verifyEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
        
    })


})