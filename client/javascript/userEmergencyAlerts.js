const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const charCount = document.querySelector('.char-count');
const chatButton = document.getElementById('chatBtn');
const chatBox = document.getElementById('chatbox');

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

messageInput.addEventListener('input', updateCharCount);

chatButton.addEventListener('click', function() {
    chatBox.classList.remove('hidden');
});

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