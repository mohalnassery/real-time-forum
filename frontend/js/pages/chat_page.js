import { loadCSS } from '../components/utils.js';
import { openChat, sendMessageHandler, populateUserList } from '../components/chat/chat.js';
import { initWebSocket } from '../components/websocket/websocket.js';

export async function initChatPage(mainContent) {
    mainContent.innerHTML = `
        <div class="chat-container">
            <div class="chat-sidebar" id="chat-sidebar">
                <!-- User list will be dynamically added here -->
            </div>
            <div class="chat-main" id="chat-main">
                <div class="chat-header" id="chat-header" data-user-id="">
                    <div class="status-indicator"></div>
                    <span>Chat with <span id="chat-nickname"></span></span>
                    <span class="typing-indicator" style="display: none;">  typing...</span>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <!-- Chat messages will be dynamically added here -->
                </div>
                <div class="chat-input" id="chat-input">
                    <input type="text" id="chat-message-input" placeholder="Type a message..." maxlength="500">
                    <button id="chat-send-button">Send</button>
                </div>
            </div>
        </div>
    `;

    loadCSS('./css/pages/chat.css');
    await populateUserList('chat-sidebar');
    document.getElementById('chat-send-button').addEventListener('click', () => {
        const input = document.getElementById('chat-message-input');
        if (input.value.trim() !== '' && input.value.length <= 500) {
            sendMessageHandler();
        }
    });
    document.getElementById('chat-message-input').addEventListener('keypress', (event) => {
        const input = event.target;
        if (event.key === 'Enter' && input.value.trim() !== '' && input.value.length <= 500) {
            sendMessageHandler();
        }
    });

    const userId = localStorage.getItem('userId');
    // initWebSocket(userId);
}