var resetBtn = document.getElementById('reset-btn');
var email;

function showLoader(){
  document.getElementById('loader').style.display = 'block';
}

function hideLoader(){
  document.getElementById('loader').style.display = 'none';
}


resetBtn.addEventListener('click', function (event) {
  event.preventDefault();
  console.log('Reset button clicked');

  showLoader();

  email = document.getElementById('email').value;

  if (!email || email === '') {
    var alert = document.getElementById('alert');
    alert.style.display = 'block';
    alert.innerText = 'Please fill in all fields';
    hideLoader();
    return;
  }

  if (!email.endsWith('@students.wits.ac.za') && !email.endsWith('@wits.ac.za')) {
    var alert = document.getElementById('alert');
    alert.style.display = 'block';
    alert.innerText = 'Please enter a valid Wits email address';
    hideLoader();
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
      hideLoader();

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
        alert.innerText = data.error;
      }
       
    })
    .catch((error) => {
        console.error('Error:', error);
        alert.style.display = "block";
        alert.innerText = "An error occured, please try again later: "+error;
        hideLoader();
    });

})