document.addEventListener("DOMContentLoaded", function(){
    console.log("User dashboard loaded!");
    
    const reportCard=document.getElementById("report-incident-card");
    const notificationsCard=document.getElementById("view-notifications-card");
    const locationCard=document.getElementById("location-services-card");
    const safetyCard=document.getElementById("safety-resources-card");

    reportCard.addEventListener("click", function(event){
        event.preventDefault();

        window.location.href="/user/reportIncident";
        
    });

    notificationsCard.addEventListener("click", function(event){
        event.preventDefault();

        alert("Delano show me some notifications!");
        
        
    });

    locationCard.addEventListener("click", function(event){
        event.preventDefault();

        alert("Who is in charge of location again?");
        
    });

    safetyCard.addEventListener("click", function(event){
        event.preventDefault();

        window.location.href="/user/safetyResources";
        
    });
    

    

    
})