var resetBtn = document.getElementById('reset-btn');
var email;

resetBtn.addEventListener('click', function (event) {
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
    alert.style.display = "block";
    alert.style.color = 'green';
    alert.style.backgroundColor = '#ddffdd';
    alert.style.border='green';
    alert.innerText = "Reset Email Sent Successfully";

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
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

})