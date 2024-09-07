var resetBtn = document.getElementById('reset-btn');
var email;

resetBtn.addEventListener('click', function (event) {
  event.preventDefault();
  console.log('Reset button clicked');
  email = document.getElementById('email').value;

  if (!email || email === '') {
    var alert = document.getElementById('alert');
    alert.style.display = 'block';
    alert.innerText = 'Please fill in all fields';
    return;
  }

  if (!email.endsWith('@students.wits.ac.za') && !email.endsWith('@wits.ac.za')) {
    var alert = document.getElementById('alert');
    alert.style.display = 'block';
    alert.innerText = 'Please enter a valid Wits email address';
    return;
  }

  console.log(email);
  var alert = document.getElementById("alert");
    

    //TIME TO POST
    fetch('/auth/forgotPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
        }),
    })
    .then((res) => res.json())
    .then((data) => {
      if(data.message==="Password reset instructions have been sent to your email."){
        console.log("Reset Link sent, please check you email");
        alert.style.display = "block";
      alert.style.color = 'green';
      alert.style.backgroundColor = '#ddffdd';
      alert.style.border='green';
      alert.innerText = "Password reset instructions have been sent to your email";
        
      }
      else if(data.error){
        console.error("Error with email stuff :", data.error);
        alert.style.display = "block";
        alert.style.color = 'red';
        alert.style.backgroundColor = '#ffdddd';
        alert.style.border = 'red';
        alert.innerText = data.error;
      }
       
    })
    .catch((error) => {
        console.error('Error:', error);
    });

})