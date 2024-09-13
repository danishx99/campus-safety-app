var panicBtn = document.getElementById('panicBtn');
var modal = document.getElementById("incidentModal"); 
var span = document.getElementById("closeModalBtn");
//var overlay = document.getElementById("modal-overlay");

panicBtn.addEventListener('click', async function(event){
    console.log("Panic button clicked");
     
    modal.style.display = "block";
    //overlay.style.display = "block";
});

span.addEventListener('click', function() {
    modal.style.display = "none";
    //overlay.style.display = "none";
});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
