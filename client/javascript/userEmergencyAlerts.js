const chatMessages = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const charCount = document.querySelector('.char-count');

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        messageInput.addEventListener('input', updateCharCount);

        function sendMessage() {
            const message = messageInput.value.trim();
            if (message) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', 'user-message');
                messageElement.textContent = message;
                chatMessages.appendChild(messageElement);
                messageInput.value = '';
                updateCharCount();
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }

        function updateCharCount() {
            const remainingChars = 200 - messageInput.value.length;
            charCount.textContent = `${remainingChars} characters remaining`;
        }