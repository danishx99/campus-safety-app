var generateBtn = document.getElementById('generate-code-btn');
var code = document.getElementById('genCode');

function showLoader(){
    document.getElementById("loader").style.display = "block";
}

function hideLoader(){
    document.getElementById("loader").style.display = "none";
}

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