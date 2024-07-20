let socket;

export function initWebSocket() {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
    };

    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);
        handleWebSocketMessage(message);
    };

    socket.onclose = function(event) {
        console.log("WebSocket is closed now.");
    };

    socket.onerror = function(error) {
        console.log("WebSocket error:", error);
    };
}

export function handleWebSocketMessage(message) {
    // Handle the message (e.g., update the UI)
    console.log("Handling WebSocket message:", message);
    displayMessage(message);
}

export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not open. Unable to send message.");
    }
}

export async function getUsers() {
    const response = await fetch('/users');
    if (response.ok) {
        return await response.json();
    } else {
        console.error("Failed to fetch users");
        return [];
    }
}

export async function getMessages(senderId, receiverId) {
    const response = await fetch(`/messages?sender_id=${senderId}&receiver_id=${receiverId}`);
    if (response.ok) {
        return await response.json();
    } else {
        console.error("Failed to fetch messages");
        return [];
    }
}

function displayMessage(message) {
    console.log("Displaying message:", message);
    const chatBox = document.querySelector(`.chat-box[data-user-id="${message.receiverId}"]`) || document.querySelector(`.chat-box[data-user-id="${message.senderId}"]`);
    if (chatBox) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = `${message.senderNickname}: ${message.content}`;
        chatBox.querySelector('.messages').appendChild(messageElement);
    }
}

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
}

async function fetchUsers() {
    const users = await getUsers();
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.textContent = user.nickname;
        userItem.addEventListener('click', () => {
            openChatBox(user);
        });
        userList.appendChild(userItem);
    });
}

async function openChatBox(user) {
    let chatBox = document.querySelector(`.chat-box[data-user-id="${user.id}"]`);
    if (!chatBox) {
        chatBox = document.createElement('div');
        chatBox.className = 'chat-box';
        chatBox.dataset.userId = user.id;
        chatBox.innerHTML = `
            <div class="chat-header">
                <span>Chat with ${user.nickname}</span>
                <button class="close-chat">X</button>
            </div>
            <div class="messages"></div>
            <div class="input">
                <input type="text" placeholder="Type a message...">
                <button class="send-message">Send</button>
            </div>
        `;
        document.body.appendChild(chatBox);

        chatBox.querySelector('.close-chat').addEventListener('click', () => {
            chatBox.remove();
        });

        chatBox.querySelector('.send-message').addEventListener('click', () => {
            const input = chatBox.querySelector('input');
            const message = {
                senderId: parseInt(localStorage.getItem('userId')), // Ensure this is set correctly
                senderNickname: localStorage.getItem('nickname'), // Ensure this is set correctly
                receiverId: user.id,
                content: input.value,
            };
            sendMessage(message);
            input.value = ''; // Clear the input field after sending the message
        });

        // Add event listener for Enter key press
        chatBox.querySelector('input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const input = chatBox.querySelector('input');
                const message = {
                    senderId: parseInt(localStorage.getItem('userId')), // Ensure this is set correctly
                    senderNickname: localStorage.getItem('nickname'), // Ensure this is set correctly
                    receiverId: user.id,
                    content: input.value,
                };
                sendMessage(message);
                input.value = ''; // Clear the input field after sending the message
            }
        });

        // Fetch and display previous messages
        const senderId = parseInt(localStorage.getItem('userId'));
        const previousMessages = await getMessages(senderId, user.id);
        previousMessages.forEach(displayMessage);
    }
    chatBox.classList.add('show');
}
