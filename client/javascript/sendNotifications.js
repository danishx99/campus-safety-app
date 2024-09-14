document.addEventListener('DOMContentLoaded', function() {

    function showLoader(){
        document.getElementById('loader').style.display = 'block';
    }

    function hideLoader(){
        document.getElementById('loader').style.display = 'none';
    }

    let sendButton = document.getElementById('sendNotificationBtn');


    sendButton.addEventListener('click', async function(event) {

    let title = document.getElementById('notificationTitle').value;

   
    let message = document.getElementById('notificationMessage').value;

    
    let notificationType = document.getElementById('notificationType').value;
    
    let recipient = document.getElementById('recipient').value;
    recipient = recipient.toLowerCase();

    console.log("notificationType", notificationType);



        event.preventDefault();

      
        showLoader();
        console.log("title", title);
        console.log("message", message);


        if(title === '' || message === '') {
            var alert = document.getElementById('alert');
            alert.style.display = 'block';
            alert.innerText = 'Please fill in all fields';
            window.scrollTo(0, 0);
            hideLoader();
            return;
        }


        try {
            const response = await fetch('/notifications/sendNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, message, notificationType, recipient }),
            });

            const data = await response.json();
            if (response.status === 200) {
                var alert = document.getElementById('alert');
                alert.style.display = 'block';
                alert.style.color = 'green';
                alert.style.backgroundColor = '#ddffdd';
                alert.style.border = 'green';
                alert.innerText = data.message;
                window.scrollTo(0, 0);
                hideLoader();

            } else {
                var alert = document.getElementById('alert');
                alert.style.display = 'block';
                alert.innerText = data.error;
                window.scrollTo(0, 0);
                hideLoader();
            }
        } catch (error) {
            console.log(error);
            var alert = document.getElementById('alert');
            alert.style.display = 'block';
            alert.innerText = 'An error occurred. Please try again.';
            window.scrollTo(0, 0);
            hideLoader();
        }
   
    });

});