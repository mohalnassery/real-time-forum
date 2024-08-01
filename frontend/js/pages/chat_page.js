import { loadCSS } from '../components/utils.js';
import { openChat, sendMessageHandler } from '../components/chat/chat.js';
import { getUsers } from '../components/websocket/websocket.js';

export async function initChatPage(mainContent) {
    mainContent.innerHTML = `
        <div class="chat-container">
            <div class="chat-sidebar" id="chat-sidebar">
                <!-- User list will be dynamically added here -->
            </div>
            <div class="chat-main" id="chat-main">
                <div class="chat-header" id="chat-header">
                    <!-- Chat header will be dynamically added here -->
                </div>
                <div class="chat-messages" id="chat-messages">
                    <!-- Chat messages will be dynamically added here -->
                </div>
                <div class="chat-input" id="chat-input">
                    <input type="text" id="chat-message-input" placeholder="Type a message...">
                    <button id="chat-send-button">Send</button>
                </div>
            </div>
        </div>
    `;

    loadCSS('./css/pages/chat.css');

    const users = await getUsers();
    const chatSidebar = document.getElementById('chat-sidebar');
    users.forEach(user => {
        if (user.lastMessageTime && user.lastMessageTime !== "0001-01-01T00:00:00Z") {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            const lastMessageTime = new Date(user.lastMessageTime).toLocaleString();
            userItem.textContent = `${user.nickname} (${lastMessageTime})`;
            userItem.addEventListener('click', () => openChat(user.id, user.nickname));
            chatSidebar.appendChild(userItem);
        }
    });

    document.getElementById('chat-send-button').addEventListener('click', sendMessageHandler);
    document.getElementById('chat-message-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessageHandler();
        }
    });
}