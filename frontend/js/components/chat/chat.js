import { getMessages, sendMessage, getUsers, sendTyping, sendStopTyping, throttle, sendChatOpened, sendChatClosed } from '../websocket/websocket.js';
import { clearAllChatNotifications, markAllChatNotificationsAsRead } from '../notifications.js';

let throttler = false;
let scrollListener = null;

export async function openChat(userId, nickname) {
    const chatHeader = document.getElementById('chat-header');
    chatHeader.dataset.userId = userId; // Store userId in dataset
    document.getElementById('chat-nickname').textContent = nickname;

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    // Make the chat-main element visible
    const chatMain = document.getElementById('chat-main');
    chatMain.classList.add('visible');

    // Remove existing scroll event listener if it exists
    if (scrollListener) {
        chatMessages.removeEventListener('scroll', scrollListener);
    }

    const messages = await getMessages(localStorage.getItem('userId'), userId);
    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (Array.isArray(messages) && messages.length > 0) {
        const messageCount = messages.length;
        const remainingMessages = Math.max(messageCount - 10, 0);
        chatMessages.dataset.remainingMessages = remainingMessages;
        for (let i = messageCount - 1; i >= remainingMessages; i--) {
            displayChatMessage(messages[i], chatMessages, true);
        }
    }

    // Add a spacer element to the top of the chat messages container if necessary
    if (chatMessages.scrollHeight <= chatMessages.clientHeight) {
        const spacer = document.createElement('div');
        spacer.id = 'chat-spacer';
        spacer.style.height = '300px'; // Adjust height as needed
        chatMessages.insertBefore(spacer, chatMessages.firstChild);
    }

    // Set the initial scroll position to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add typing event listeners
    const input = document.getElementById('chat-message-input');
    let typingTimeout;

    input.addEventListener('keyup', throttle(() => {
        let prevTyping = input.dataset.status;
        if (input.value && !prevTyping) {
            sendTyping(userId);
            input.dataset.status = "typing";
        } else if (!input.value && prevTyping) {
            sendStopTyping(userId);
            input.dataset.status = "";
        }
    }));

    // Scroll event listener
    scrollListener = async () => {
        let remainingMessages = chatMessages.dataset.remainingMessages;
        if (chatMessages.scrollTop <= 5 && remainingMessages > 0 && !throttler) {
            throttler = true;
            setTimeout(async () => {
                const prevScrollHeight = chatMessages.scrollHeight;
                const newRemainingMessages = Math.max(remainingMessages - 10, 0);
                chatMessages.dataset.remainingMessages = newRemainingMessages;
                for (let i = remainingMessages - 1; i >= newRemainingMessages; i--) {
                    displayChatMessage(messages[i], chatMessages, true);
                }
                chatMessages.scrollTo(0, chatMessages.scrollHeight - prevScrollHeight);
                throttler = false;

                // Remove the spacer if it exists
                const existingSpacer = document.getElementById('chat-spacer');
                if (existingSpacer) {
                    chatMessages.removeChild(existingSpacer);
                }
            }, 500);
        }
    };

    chatMessages.addEventListener('scroll', scrollListener);

    // Ensure there's always enough space to scroll
    if (chatMessages.scrollHeight <= chatMessages.clientHeight) {
        chatMessages.style.minHeight = '300px';
    }

    // Reset throttler
    throttler = false;

    // Clear all notifications for this user
    clearAllChatNotifications(userId);

    // Mark all notifications as read for this user
    await markAllChatNotificationsAsRead(userId);

    // Send a message to indicate that the chat is opened
    sendChatOpened(userId);
}

export function displayChatMessage(message, container, start = true) {
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
    if (start) {
        chatMessages.insertBefore(messageElement, chatMessages.firstChild);
    } else {
        chatMessages.appendChild(messageElement);
    }
}

export function sendMessageHandler() {
    const input = document.getElementById('chat-message-input');
    const notification = document.getElementById('message-notification');

    if (input.value.trim() !== '' && input.value.length <= 380) {
        const message = {
            senderId: parseInt(localStorage.getItem('userId')),
            senderNickname: localStorage.getItem('nickname'),
            receiverId: parseInt(document.getElementById('chat-header').dataset.userId),
            content: input.value,
            createdAt: new Date().toISOString(),
            type: 'chat'
        };
        sendMessage(message);
        input.value = '';
        document.getElementById('char-count').textContent = '0/380';
        populateChatSidebar();
    } else if (input.value.length > 380) {
        notification.textContent = "Message is too long and cannot be sent!";
        notification.style.display = 'block';
    }
}

export async function populateChatSidebar(chatSidebarId = "chat-sidebar") {
    // Check if sidebar exists
    const chatSidebar = document.getElementById(chatSidebarId);
    if (!chatSidebar) {
        return;
    }

    const users = await getUsers();

    const recentUsers = users
        .filter(user => user.lastMessageTime && user.lastMessageTime !== "0001-01-01T00:00:00Z")
        .sort((b, a) => new Date(a.lastMessageTime) - new Date(b.lastMessageTime));

    const newUsers = users
        .filter(user => !user.lastMessageTime || user.lastMessageTime === "0001-01-01T00:00:00Z")
        .sort((a, b) => a.nickname.localeCompare(b.nickname));

    // Clear existing content
    chatSidebar.innerHTML = '';

    // Create Recent Messages section
    const recentSection = document.createElement('div');
    recentSection.className = 'recent-section';
    const recentHeader = document.createElement('h3');
    recentHeader.textContent = 'Recent Messages';
    recentSection.appendChild(recentHeader);

    recentUsers.forEach(user => {
        const userItem = createUserItem(user);
        recentSection.appendChild(userItem);
    });

    chatSidebar.appendChild(recentSection);

    // Create New Chat section
    const newChatSection = document.createElement('div');
    newChatSection.className = 'new-chat-section';
    const newChatHeader = document.createElement('h3');
    newChatHeader.textContent = 'Create New Chat';
    newChatSection.appendChild(newChatHeader);

    const newChatToggle = document.createElement('button');
    newChatToggle.className = 'new-chat-toggle';
    newChatToggle.textContent = 'Show/Hide';
    newChatToggle.addEventListener('click', () => {
        newChatUsersDiv.classList.toggle('show');
    });
    newChatSection.appendChild(newChatToggle);

    // Create a div to hold new users
    const newChatUsersDiv = document.createElement('div');
    newChatUsersDiv.className = 'new-chat-users';
    newUsers.forEach(user => {
        const userItem = createUserItem(user);
        // Remove the time from the user item
        userItem.querySelector('span').textContent = user.nickname; // Only show nickname
        newChatUsersDiv.appendChild(userItem);
    });
    newChatSection.appendChild(newChatUsersDiv); // Append the users div to the new chat section

    chatSidebar.appendChild(newChatSection);
}

function createUserItem(user) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.dataset.userId = user.id;

    const statusIndicator = document.createElement('div');
    statusIndicator.className = `status-indicator ${user.status}`;

    const userName = document.createElement('span');
    userName.textContent = `${user.nickname} (${new Date(user.lastMessageTime).toLocaleString()})`;

    userItem.appendChild(statusIndicator);
    userItem.appendChild(userName);

    userItem.addEventListener('click', () => openChat(user.id, user.nickname));
    return userItem;
}

function closeSidebar(event) {
    const userSidebar = document.getElementById('user-sidebar');
    if (userSidebar && !userSidebar.contains(event.target)) {
        userSidebar.classList.remove('show');
    }
}

export function closeChat(userId) {
    sendChatClosed(userId);
}