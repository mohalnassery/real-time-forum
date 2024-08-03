import { displayChatMessage } from '../chat/chat.js';
import { displayMessage, updateUserStatus } from './chat_box.js';

let socket;

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

export function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error("WebSocket is not open. Unable to send message.");
    }
}

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

export function handleWebSocketMessage(message) {
    if (message.type === "chat") {
        const chatPageContainer = document.getElementById('chat-messages');
        const activeChatUserId = document.getElementById('chat-header')?.dataset.userId;

        if (chatPageContainer && (message.senderId == activeChatUserId || message.receiverId == activeChatUserId)) {
            displayChatMessage(message, chatPageContainer, false); // Update chat messages dynamically on the chat page
            chatPageContainer.scrollTo(0, chatPageContainer.scrollHeight);
            
        } else {
            displayMessage(message, false);
            const messageWindow = document.querySelector(`.chat-box[data-user-id="${message.receiverId}"] .messages`) || document.querySelector(`.chat-box[data-user-id="${message.senderId}"] .messages`);
            if (messageWindow) {
                messageWindow.scrollTo(0, messageWindow.scrollHeight);
            }
        }
    } else if (message.type === "status") {
        updateUserStatus(message.senderId, message.content);
    } else if (message.type === "typing") {
        showTypingIndicator(message.senderId);
    } else if (message.type === "stop typing") {
        hideTypingIndicator(message.senderId);
    }
}

export function showTypingIndicator(userId) {
    const chatHeader = document.querySelector(`.chat-header[data-user-id="${userId}"] .typing-indicator`);
    if (chatHeader) {
        chatHeader.style.display = 'inline';
    }
}

export function hideTypingIndicator(userId) {
    const chatHeader = document.querySelector(`.chat-header[data-user-id="${userId}"] .typing-indicator`);
    if (chatHeader) {
        chatHeader.style.display = 'none';
    }
}
