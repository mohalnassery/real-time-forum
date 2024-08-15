import { loadCSS } from '../components/utils.js';
import { openChat, sendMessageHandler, populateChatSidebar } from '../components/chat/chat.js';

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
                    <span class="typing-indicator" style="display: none;"></span>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <!-- Chat messages will be dynamically added here -->
                </div>
                <div class="chat-input" id="chat-input">
                    <input type="text" id="chat-message-input" placeholder="Type a message..." maxlength="380">
                    <span id="char-count">0/380</span>
                    <button id="chat-send-button">Send</button>
                </div>
                <div id="message-notification" class="message-notification"></div>
            </div>
        </div>
    `;

    loadCSS('./css/pages/chat.css');
    await populateChatSidebar('chat-sidebar');
    document.getElementById('chat-send-button').addEventListener('click', () => {
        const input = document.getElementById('chat-message-input');
        if (input.value.trim() !== '' && input.value.length <= 380) {
            sendMessageHandler();
        } else if (input.value.length > 380) {
            notification.textContent = "Message is too long and cannot be sent!";
            notification.style.display = 'block';
        }
    });
    document.getElementById('chat-message-input').addEventListener('keypress', (event) => {
        const input = event.target;
        if (event.key === 'Enter' && input.value.trim() !== '' && input.value.length <= 380) {
            sendMessageHandler();
        } else if (event.key === 'Enter' && input.value.length > 380) {
            notification.textContent = "Message is too long and cannot be sent!";
            notification.style.display = 'block';
        }
    });

    const input = document.getElementById('chat-message-input');
    const charCount = document.getElementById('char-count');
    const notification = document.getElementById('message-notification');

    input.addEventListener('input', () => {
        const length = input.value.length;
        charCount.textContent = `${length}/380`;
        
        if (length > 380) {
            notification.textContent = "Message is too long!";
            notification.style.display = 'block';
        } else {
            notification.style.display = 'none';
        }
    });

    const userId = localStorage.getItem('userId');

    // Populate user list initially and set up periodic refresh
    await populateChatSidebar('chat-sidebar');
    setInterval(() => populateChatSidebar('chat-sidebar'), 30000); // Refresh every 30 seconds
}