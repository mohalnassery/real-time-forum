import { getUsers, getMessages, sendMessage, sendTyping, sendStopTyping, throttle, sendChatOpened, sendChatClosed } from './websocket.js';
import { clearAllChatNotifications, markAllChatNotificationsAsRead } from '../notifications.js';

let throttler = false;
let typingTimeout;

// Function to create the user sidebar
export function createUserSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'user-sidebar';
    sidebar.className = 'sidebar';

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });
    sidebar.appendChild(closeButton);

    const userList = document.createElement('div');
    userList.id = 'user-list';
    sidebar.appendChild(userList);

    document.body.appendChild(sidebar);

    fetchUsers();

    // Add event listener to user icon to toggle sidebar
    document.getElementById("user-icon").addEventListener("click", () => {
        // clear the existing items in user-sidebar class
        populateUserSidebar("user-sidebar");
        document.getElementById("user-sidebar").classList.toggle("show");
    });

    // Close sidebar when clicking outside of it
    document.addEventListener("click", (event) => {
        const sidebar = document.getElementById("user-sidebar");
        if (sidebar.classList.contains("show") && !sidebar.contains(event.target) && !event.target.matches('.user-icon, .user-icon *')) {
            sidebar.classList.remove("show");
        }
    });
}

// Fetch users from the server and display them in the user sidebar
async function fetchUsers() {
    const users = await getUsers();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    // Sort users by username (nickname)
    users.sort((a, b) => a.nickname.localeCompare(b.nickname));

    users.forEach(user => {
        if (user.nickname != localStorage.getItem("nickname")) {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.dataset.userId = user.id; // Add user ID to the dataset

            // Create status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.className = `status-indicator ${user.status}`;

            const userName = document.createElement('span');
            userName.textContent = user.nickname;

            userItem.appendChild(statusIndicator);
            userItem.appendChild(userName);

            userItem.addEventListener('click', () => {
                openChatBox(user);
            });
            userList.appendChild(userItem);
        }
    });
}

// Display a message in the chat box
export function displayMessage(message, start = true) {
    const chatBox = document.querySelector(`.chat-box[data-user-id="${message.receiverId}"]`) || document.querySelector(`.chat-box[data-user-id="${message.senderId}"]`);
    if (chatBox) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

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
        messageHeader.innerHTML = `<strong>${message.senderNickname}</strong> <em>${formattedDate}</em>`;

        // Create the message content element
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message.content;

        // Append the header and content to the message content container
        messageContentContainer.appendChild(messageHeader);
        messageContentContainer.appendChild(messageContent);

        // Append the profile picture and content container to the message element
        messageElement.appendChild(profilePicture);
        messageElement.appendChild(messageContentContainer);

        // Append the message element to the chat messages container
        const messageWindow = chatBox.querySelector('.messages');
        if (start) {
            messageWindow.insertBefore(messageElement, messageWindow.firstChild);
        } else {
            messageWindow.appendChild(messageElement);
        }
    }
}

// Open a chat box with a user
export async function openChatBox(user) {
    let chatBox = document.querySelector(`.chat-box[data-user-id="${user.id}"]`);
    if (!chatBox) {
        chatBox = document.createElement('div');
        chatBox.className = 'chat-box';
        chatBox.dataset.userId = user.id;
        chatBox.innerHTML = `
            <div class="chat-header" data-user-id="${user.id}">
                <div class="chat-title">
                    <div class="status-indicator ${user.status}"></div>
                    <span>${user.nickname}</span>
                    <span class="typing-indicator" style="display: none;">typing...</span>
                </div>
                <button class="close-chat">X</button>
            </div>
            <div class="messages"></div>
            <div class="input">
                <input type="text" placeholder="Type a message..." maxlength="380">
                <button class="send-message">Send</button>
            </div>
        `;
        document.body.appendChild(chatBox);

        chatBox.querySelector('.close-chat').addEventListener('click', () => {
            closeChatBox(user.id);
        });

        const input = chatBox.querySelector('input');

        input.addEventListener('keyup', throttle(() => {
            let prevTyping = input.dataset.status;
            if (input.value && !prevTyping) {
                sendTyping(user.id);
                input.dataset.status = "typing";
            } else if (!input.value && prevTyping) {
                sendStopTyping(user.id);
                input.dataset.status = "";
            }
        }));

        chatBox.querySelector('.send-message').addEventListener('click', () => {
            if (input.value.trim() !== '' && input.value.length <= 380) {
                const message = {
                    senderId: parseInt(localStorage.getItem('userId')),
                    senderNickname: localStorage.getItem('nickname'),
                    receiverId: user.id,
                    content: input.value,
                    createdAt: new Date().toISOString(), // Add timestamp
                    type: "chat"
                };
                sendMessage(message);
                input.value = ''; // Clear the input field after sending the message
                sendStopTyping(user.id);
            }
        });

        // Add event listener for Enter key press
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && input.value.trim() !== '' && input.value.length <= 380) {
                const message = {
                    senderId: parseInt(localStorage.getItem('userId')),
                    senderNickname: localStorage.getItem('nickname'),
                    receiverId: user.id,
                    content: input.value,
                    createdAt: new Date().toISOString(), // Add timestamp
                    type: "chat"
                };
                sendMessage(message);
                input.value = ''; // Clear the input field after sending the message
                sendStopTyping(user.id);
            }
        });

        const messageWindow = chatBox.querySelector('.messages');
        const previousMessages = await getMessages(localStorage.getItem('userId'), user.id);
        if (Array.isArray(previousMessages) && previousMessages.length > 0) {
            const messageCount = previousMessages.length;
            const remainingMessages = Math.max(messageCount - 10, 0);
            messageWindow.dataset.remainingMessages = remainingMessages;
            for (let i = messageCount - 1; i >= remainingMessages; i--) {
                displayMessage(previousMessages[i], true);
            }
            messageWindow.scrollTo(0, messageWindow.scrollHeight);
        }

        // Scroll event listener
        messageWindow.addEventListener('scroll', () => {
            let remainingMessages = messageWindow.dataset.remainingMessages;
            if (messageWindow.scrollTop <= 5 && remainingMessages > 0 && !throttler) {
                throttler = true;
                setTimeout(() => {
                    const prevScrollHeight = messageWindow.scrollHeight;
                    const newRemainingMessages = Math.max(remainingMessages - 10, 0);
                    messageWindow.dataset.remainingMessages = newRemainingMessages;
                    for (let i = remainingMessages - 1; i >= newRemainingMessages; i--) {
                        displayMessage(previousMessages[i], true);
                    }

                    messageWindow.scrollTo(0, messageWindow.scrollHeight - prevScrollHeight);
                    throttler = false;
                }, 500);
            }
        });
    }
    chatBox.classList.add('show');

    // Clear all notifications for this user
    clearAllChatNotifications(user.id);

    // Mark all notifications as read for this user
    await markAllChatNotificationsAsRead(user.id);

    // Send a message to indicate that the chat is opened
    sendChatOpened(user.id);

    // Scroll to the bottom of the chat
    const messageWindow = chatBox.querySelector('.messages');
    messageWindow.scrollTop = messageWindow.scrollHeight;
}

// Update the status of a user in the chat box
export function updateUserStatus(userId, status) {
    const userItem = document.querySelector(`.user-item[data-user-id="${userId}"] .status-indicator`);
    if (userItem) {
        userItem.className = `status-indicator ${status}`;
    } 
}

// Close a chat box with a user
export function closeChatBox(userId) {
    const chatBox = document.querySelector(`.chat-box[data-user-id="${userId}"]`);
    if (chatBox) {
        chatBox.remove(); // Remove the chat box element from the DOM
        // Send a message to indicate that the chat is closed
        sendChatClosed(userId);
    }
}


export async function populateUserSidebar(userSidebarId) {
    userSidebarId = "user-sidebar";
    const userSidebar = document.getElementById(userSidebarId);
    if (!userSidebar) {
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
    userSidebar.innerHTML = '';

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', () => {
        userSidebar.classList.remove('show');
    });
    userSidebar.appendChild(closeButton);

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

    userSidebar.appendChild(recentSection);

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
    newChatUsersDiv.className = 'new-chat-usersidebar show'; // Initially show users
    newUsers.forEach(user => {
        const userItem = createUserItem(user);
        // Remove the time from the user item
        userItem.querySelector('span').textContent = user.nickname; // Only show nickname
        newChatUsersDiv.appendChild(userItem);
    });
    newChatSection.appendChild(newChatUsersDiv); // Append the users div to the new chat section

    userSidebar.appendChild(newChatSection);

    // Function to create a user item element
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

        userItem.addEventListener('click', () => openChatBox(user));
        return userItem;
    }
}