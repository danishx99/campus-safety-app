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

        console.log(email);
        
        
    })

    
})