let socket;
let throttler = false;

export function initWebSocket(id) {
    socket = new WebSocket(`ws://localhost:8080/ws?clientId=${id}`);

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
    
    if (message.type === "chat") {
        displayMessage(message, false);
        const messageWindow = document.querySelector('.messages')
        messageWindow.scrollTo(0, messageWindow.scrollHeight)
    }
}

export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not open. Unable to send message.");
    }
}

export async function getUsers() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`/users?user_id=${userId}`);
    if (response.ok) {
        return await response.json();
    } else {
        console.error("Failed to fetch users");
        return [];
    }
}

export async function getMessages(senderId, receiverId) {
    try {
        const response = await fetch(`/messages?sender_id=${senderId}&receiver_id=${receiverId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error("Failed to fetch messages");
            return [];
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

function displayMessage(message, start=true) {
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

        //chatBox.querySelector('.messages').appendChild(messageElement);
        const messageWindow = chatBox.querySelector('.messages')
        if (start) {
            messageWindow.insertBefore(messageElement, messageWindow.firstChild)
        } else {
            messageWindow.appendChild(messageElement)
        }
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

    // Sort users by nickname
    users.sort((a, b) => a.nickname.localeCompare(b.nickname));

    users.forEach(user => {
        if (user.nickname != localStorage.getItem("nickname")) {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.textContent = user.nickname;
            userItem.addEventListener('click', () => {
                openChatBox(user);
            });
            userList.appendChild(userItem);
        }
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
                timestamp: new Date().toISOString(), // Add timestamp
                type: "chat"
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
                    timestamp: new Date().toISOString(), // Add timestamp
                    type: "chat"
                };
                sendMessage(message);
                input.value = ''; // Clear the input field after sending the message
            }
        });
        
        const messageWindow = chatBox.querySelector('.messages')

        // Fetch and display previous messages
        const senderId = parseInt(localStorage.getItem('userId'));
        const previousMessages = await getMessages(senderId, user.id);
        if (Array.isArray(previousMessages) && previousMessages.length > 0) {
            const messageCount = previousMessages.length
            const remainingMessages = Math.max(messageCount-10,0)
            messageWindow.dataset.remainingMessages = remainingMessages;
            for (let i=messageCount-1; i>=remainingMessages;i--) {
                displayMessage(previousMessages[i],true)
            }
            messageWindow.scrollTo(0, messageWindow.scrollHeight)
        }

        // scroll event listener
        messageWindow.addEventListener('scrollend', () => {
            let remainingMessages = messageWindow.dataset.remainingMessages;
            if (messageWindow.scrollTop <= 5 && remainingMessages > 0 && !throttler) {
                throttler = true;

                
                const prevScrollHeight = messageWindow.scrollHeight
                const newRemainingMessages = Math.max(remainingMessages-10,0);
                messageWindow.dataset.remainingMessages = newRemainingMessages;
                for (let i=remainingMessages-1; i>=newRemainingMessages;i--) {
                    displayMessage(previousMessages[i], true)
                }
                
                messageWindow.scrollTo(0, messageWindow.scrollHeight - prevScrollHeight)

                setTimeout(() => {
                    throttler = false
                },1000)
            }
        });


    }
    chatBox.classList.add('show');
}
