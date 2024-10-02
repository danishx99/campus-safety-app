document.addEventListener("DOMContentLoaded", function () {
  // Extract token from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  var alert = document.getElementById("alert");

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
      if (data.message === "Email verified successfully!") {
        alert.style.display = "block";
        alert.style.color = "green";
        alert.style.backgroundColor = "#ddffdd";
        alert.style.border = "green";
        alert.innerText = "Email verified successfully!";

        // Check for data.redirect and redirect
      } else if (data.error) {
        console.error("Error verifying email:", data.error);
        alert.style.display = "block";
        alert.style.color = "red";
        alert.style.backgroundColor = "#ffdddd";
        alert.style.border = "red";
        alert.innerText = data.error;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  var resendBtn = document.getElementById("resend-btn");

  resendBtn.addEventListener("click", function (event) {
    console.log("Resend button clicked");
    //redirect to login page
    window.location.href = "/login";
  });
});
