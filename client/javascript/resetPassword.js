var resetBtn = document.getElementById('reset-btn');

let new_password;
let conf_password;

resetBtn.addEventListener('click', function (event) {
    console.log('Reset button clicked');

    new_password = document.getElementById('psw').value;
    conf_password = document.getElementById('conf-psw').value;

    // check fields are not empty
    if (
        !new_password ||
        !conf_password ||
        new_password === '' ||
        conf_password === ''
    ) {
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = "Please fill in all fields";
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
        return;
      }
      
      // make sure password == confirmed password
      if (new_password !== conf_password) {
        alert.innerText ="Passwords do not match.";
        return;
      }

    var alert = document.getElementById("alert");
    alert.style.display = "block";
    alert.style.color = 'green';
    alert.style.backgroundColor = '#ddffdd';
    alert.style.border='green';
    alert.innerText = "Reset Successfull";


});