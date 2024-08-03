import { getMessages, sendMessage, getUsers } from '../websocket/websocket.js';

export async function openChat(userId, nickname) {
    const chatHeader = document.getElementById('chat-header');
    chatHeader.textContent = `Chat with ${nickname}`;
    chatHeader.dataset.userId = userId; // Store userId in dataset

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    const messages = await getMessages(localStorage.getItem('userId'), userId);
    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    messages.forEach(message => {
        displayChatMessage(message, chatMessages, false); // Ensure start is false for initial load
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function displayChatMessage(message, container, start = false) {
    const chatMessages = typeof container === 'string' ? document.getElementById(container) : container;
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';

    // Create the profile picture element
    const profilePicture = document.createElement('div');
    profilePicture.className = 'profile-picture';
    profilePicture.textContent = message.senderNickname.charAt(0).toUpperCase();

    // Create the message content container
    const messageContentContainer = document.createElement('div');
    messageContentContainer.className = 'message-content-container';

    // Create the message header element
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';

    // Format the date
    const date = new Date(message.createdAt);
    const formattedDate = date.toLocaleString();

    // Set the message header content with sender's name and date
    messageHeader.innerHTML = `<strong>${message.senderNickname}</strong> <span class="message-time">${formattedDate}</span>`;

    // Create the message content element
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message.content;

    // Append elements to the message content container
    messageContentContainer.appendChild(messageHeader);
    messageContentContainer.appendChild(messageContent);

    // Append profile picture and message content container to the message element
    messageElement.appendChild(profilePicture);
    messageElement.appendChild(messageContentContainer);

    // Append the message element to the chat messages container
    chatMessages.appendChild(messageElement);

    // Scroll to the bottom of the chat messages container
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function sendMessageHandler() {
    const input = document.getElementById('chat-message-input');
    const message = {
        senderId: parseInt(localStorage.getItem('userId')),
        senderNickname: localStorage.getItem('nickname'),
        receiverId: parseInt(document.getElementById('chat-header').dataset.userId),
        content: input.value,
        createdAt: new Date().toISOString(), // Add timestamp
        type: 'chat'
    };
    sendMessage(message);
    input.value = '';
    populateUserList('chat-sidebar');
}

export async function populateUserList(chatSidebarId) {
    const chatSidebar = document.getElementById(chatSidebarId);
    chatSidebar.innerHTML = ''; // Clear the existing user list

    const users = await getUsers();
    users.forEach(user => {
        if (user.lastMessageTime && user.lastMessageTime !== "0001-01-01T00:00:00Z") {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.dataset.userId = user.id; // Store userId in dataset

            // Create status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.className = `status-indicator ${user.status}`;

            const userName = document.createElement('span');
            const lastMessageTime = new Date(user.lastMessageTime).toLocaleString();
            userName.textContent = `${user.nickname} (${lastMessageTime})`;

            userItem.appendChild(statusIndicator);
            userItem.appendChild(userName);

            userItem.addEventListener('click', () => openChat(user.id, user.nickname));
            chatSidebar.appendChild(userItem);
        }
    });
}