var generateBtn = document.getElementById('generate-code-btn');
var code = document.getElementById('genCode');
const copyCode = document.getElementById("copyCode");

function showLoader(){
    document.getElementById("loader").style.display = "block";
}

function hideLoader(){
    document.getElementById("loader").style.display = "none";
}

copyCode.addEventListener("click", function () {
    //check if code is empty
    if (!(code.value === "")) {
      code.select();
      code.setSelectionRange(0, 99999); /* For mobile devices */
      document.execCommand("copy");
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Admin code copied ";
      alert.className =
        "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
    }
  });

generateBtn.addEventListener('click', function() {
    showLoader();
    fetch('/auth/generateCode', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        
        if (data.error) {
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText = "An error occurred. Please try again";
            window.scrollTo(0, 0);
            hideLoader();
        }
        else if (data.message) {
            console.log(data);
            code.value = data.message;
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.style.color = 'green';
            alert.style.backgroundColor = '#ddffdd';
            alert.style.border = 'green';
            alert.innerText = "Code generated successfully";
            hideLoader();

            window.scrollTo(0, 0);
        }
    
    })
    .catch(err => {
        //console.log("Error:", err);
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.style.color = 'red-700';
            alert.style.backgroundColor = 'red-100';
            alert.style.border = 'red-400';
            alert.innerText = "Error" + err;
            window.scrollTo(0, 0);
            hideLoader();
    });

});