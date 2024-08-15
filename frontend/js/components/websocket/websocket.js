import { displayChatMessage } from '../chat/chat.js';
import { displayMessage, updateUserStatus } from './chat_box.js';
import { handleChatNotification } from '../nav.js';
import { populateChatSidebar } from '../chat/chat.js'; // Import the function

let socket;

// Initialize the WebSocket connection
export function initWebSocket(id) {
    socket = new WebSocket(`ws://localhost:8080/ws?clientId=${id}`);

    socket.onopen = function(event) {
        console.log("WebSocket is open now.");
    };

    socket.onmessage = function(event) {
        //console.log("Raw WebSocket message received:", event.data);
        try {
            // Split the message by newlines to handle multiple JSON objects
            const messages = event.data.split('\n').filter(msg => msg.trim() !== '');
            messages.forEach(msg => {
                const message = JSON.parse(msg);
                //console.log("Parsed WebSocket message:", message);
                handleWebSocketMessage(message);
            });
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            console.error("Problematic message:", event.data);
        }
    };

    socket.onclose = function(event) {
        console.log("WebSocket is closed now.");
    };

    socket.onerror = function(error) {
        console.log("WebSocket error:", error);
    };
}

// Handle a WebSocket message
export function handleWebSocketMessage(message) {
    if (message.type === "chat") {
        const chatPageContainer = document.getElementById('chat-messages');
        const activeChatUserId = document.getElementById('chat-header')?.dataset.userId;
        const currentUserId = parseInt(localStorage.getItem('userId'));

        if (chatPageContainer && (message.senderId == activeChatUserId || message.receiverId == activeChatUserId)) {
            displayChatMessage(message, chatPageContainer, false);
            chatPageContainer.scrollTo(0, chatPageContainer.scrollHeight);
            populateChatSidebar('chat-sidebar');
        } else if (message.receiverId === currentUserId) {
            // Show notification only if the current user is the receiver and not in an active chat with the sender
            const activeChatBox = document.querySelector(`.chat-box[data-user-id="${message.senderId}"].show`);
            if (!activeChatBox) {
                handleChatNotification(message);
            }
        }
        displayMessage(message, false);
        const messageWindow = document.querySelector(`.chat-box[data-user-id="${message.receiverId}"] .messages`) || document.querySelector(`.chat-box[data-user-id="${message.senderId}"] .messages`);
        if (messageWindow) {
            messageWindow.scrollTo(0, messageWindow.scrollHeight);
        }
        // update the chat-sidebar user list
        const userToBoost = document.querySelector(`#chat-sidebar .user-item[data-user-id="${message.senderId}"]`) || document.querySelector(`#chat-sidebar .user-item[data-user-id="${message.receiverId}"]`);
        if (userToBoost) {
            const userlist = document.getElementById('chat-sidebar');
            userlist.insertBefore(userToBoost, userlist.firstChild);
        }
    } else if (message.type === "status") {
        updateUserStatus(message.senderId, message.content);
    } else if (message.type === "typing") {
        showTypingIndicator(message.senderId);
    } else if (message.type === "stop typing") {
        hideTypingIndicator(message.senderId);
    }
}

// Send a message to the server
export function sendMessage(message) {
    const maxAttempts = 3; // Maximum number of attempts
    let attempts = 0;

    const trySendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not open. Unable to send message.");
            if (attempts < maxAttempts) {
                attempts++;
                console.log(`Attempting to reopen WebSocket (${attempts}/${maxAttempts})...`);
                initWebSocket(id);
                setTimeout(trySendMessage, 1000); // Wait before trying again
            } else {
                console.error("Failed to send message after multiple attempts.");
            }
        }
    };

    trySendMessage();
}

// Send a typing message to the server
export function sendTyping(receiverId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type: "typing",
            senderId: parseInt(localStorage.getItem('userId')),
            receiverId: receiverId,
        };
        socket.send(JSON.stringify(message));
    }
}

// Send a stop typing message to the server
export function sendStopTyping(receiverId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type: "stop typing",
            senderId: parseInt(localStorage.getItem('userId')),
            receiverId: receiverId,
        };
        socket.send(JSON.stringify(message));
    }
}

// Fetch users from the server
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

// Fetch messages between two users
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

// Show a typing indicator in the chat header
export function showTypingIndicator(userId) {
    // Check for typing indicator in chat header
    const chatHeaderIndicator = document.querySelector(`.chat-header[data-user-id="${userId}"] .typing-indicator`);
    if (chatHeaderIndicator) {
        chatHeaderIndicator.style.display = 'inline';
    }

    // Check for typing indicator in chat box
    const chatBoxIndicator = document.querySelector(`.chat-box[data-user-id="${userId}"] .typing-indicator`);
    if (chatBoxIndicator) {
        chatBoxIndicator.style.display = 'inline';
    }
}

// Hide a typing indicator in the chat header
export function hideTypingIndicator(userId) {
    // Check for typing indicator in chat header
    const chatHeaderIndicator = document.querySelector(`.chat-header[data-user-id="${userId}"] .typing-indicator`);
    if (chatHeaderIndicator) {
        chatHeaderIndicator.style.display = 'none';
    }

    // Check for typing indicator in chat box
    const chatBoxIndicator = document.querySelector(`.chat-box[data-user-id="${userId}"] .typing-indicator`);
    if (chatBoxIndicator) {
        chatBoxIndicator.style.display = 'none';
    }
}

// Debounce a function
export function debounce(func, timeout = 500){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

// Throttle a function
export function throttle(mainFunction, delay = 500) {
    let timerFlag = null; // Variable to keep track of the timer
  
    // Returning a throttled version 
    return (...args) => {
      if (timerFlag === null) { // If there is no timer currently running
        mainFunction(...args); // Execute the main function 
        timerFlag = setTimeout(() => { // Set a timer to clear the timerFlag after the specified delay
          timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
        }, delay);
      }
    };
}

// Send a chat opened message to the server
export function sendChatOpened(receiverId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type: "chat_opened",
            senderId: parseInt(localStorage.getItem('userId')),
            receiverId: receiverId
        };
        socket.send(JSON.stringify(message));
    }
}

// Send a chat closed message to the server
export function sendChatClosed(receiverId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type: "chat_closed",
            senderId: parseInt(localStorage.getItem('userId')),
            receiverId: receiverId
        };
        socket.send(JSON.stringify(message));
    }
}