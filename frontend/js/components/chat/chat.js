import { getMessages, sendMessage } from '../websocket/websocket.js';

export async function openChat(userId, nickname) {
    const chatHeader = document.getElementById('chat-header');
    chatHeader.textContent = `Chat with ${nickname}`;
    chatHeader.dataset.userId = userId; // Store userId in dataset

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    const messages = await getMessages(localStorage.getItem('userId'), userId);
    messages.forEach(message => {
        displayMessage(message);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function displayMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = `${message.senderNickname}: ${message.content}`;
    chatMessages.appendChild(messageElement);
}

export function sendMessageHandler() {
    const input = document.getElementById('chat-message-input');
    const message = {
        senderId: parseInt(localStorage.getItem('userId')),
        senderNickname: localStorage.getItem('nickname'),
        receiverId: parseInt(document.getElementById('chat-header').dataset.userId),
        content: input.value,
        type: 'chat'
    };
    sendMessage(message);
    input.value = '';
}


