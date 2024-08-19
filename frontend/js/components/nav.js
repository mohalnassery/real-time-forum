import { fetchAndDisplayNotifications, markAllNotificationsAsRead, updateNotificationCounter } from './notifications.js';
import { logout } from './auth/auth_handling.js';
import { populateUserSidebar } from './websocket/chat_box.js'; // Import the function

let isLoggedIn = false; // Variable to track login status

export function createNavBar(navbar) {
    navbar.innerHTML = `
        <div class="header">
            <a id="logo">
                <img src="/assets/logo.png" alt="Logo" class="logo" style="height: 50px; width: auto;">
            </a>
            <div class="user-auth">
                <label class="theme-switch">
                    <input type="checkbox" id="theme-toggle">
                    <span class="slider"></span>
                </label>
                <div class="notification-icon" hidden>
                    <i class="fa-solid fa-bell"></i>
                    <div class="notification-counter" id="notification-counter" hidden></div>
                    <div class="notification-dropdown">
                        <div class="mark-all-read">
                        </div>
                    </div>
                </div>
                <button class="link-buttons" id="toggle-login" hidden disabled >Login</button>
                <button class="link-buttons" id="toggle-signup" hidden disabled >SignUp</button>
                <button class="link-buttons" id="logout-btn" hidden disabled >LogOut</button>
                <div class="user-info" display="none">
                    <p id="nickname">
                    </p>
                </div>
                <div class="user-icon" id="user-icon" hidden>
                    <i class="fa-solid fa-users"></i>
                </div>
                <button class="link-buttons" id="chat-btn" hidden>Chat</button>
            </div>
        </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", async () => {
        await logout();
    });

    document.getElementById("logo").addEventListener("click", () => {
        window.location.hash = "";
    })

    document.getElementById("chat-btn").addEventListener("click", () => {
        const chatBox = document.querySelector(".chat-box");
        if (chatBox) {
            chatBox.classList.toggle("show");
        }
        window.location.hash = "#chat";
    });
    
    const chatSendButton = document.getElementById('chat-send-button');
    const chatMessageInput = document.getElementById('chat-message-input');

    if (chatSendButton) {
        chatSendButton.addEventListener('click', () => sendMessageHandler('chat-messages'));
    }

    if (chatMessageInput) {
        chatMessageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessageHandler('chat-messages');
            }
        });
    }

    // Add event listener to nickname element to redirect to profile page
    document.getElementById("nickname").addEventListener("click", async () => {
        // fetching and set user ID again
        const response = await fetch("/auth/is-logged-in");
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("userId", data.userId);
        } else {
            console.error("Failed to fetch user ID:", response.status);
        }
        const userID = localStorage.getItem("userId");
        window.location.href = `/#profile?user_id=${userID}`;
    });

    // Add "Mark all as read" button
    const notificationIcon = document.getElementsByClassName("notification-icon")[0];
    const notificationDropdown = document.getElementsByClassName("notification-dropdown")[0];
    document.getElementsByClassName("mark-all-read")[0].addEventListener("click", async () => {
        await markAllNotificationsAsRead();
        notificationDropdown.innerHTML = "";
        updateNotificationCounter(0); // Reset counter
    });

    // Add event listener to toggle dropdown visibility and fetch notifications
    notificationIcon.addEventListener("click", async (event) => {
        event.stopPropagation();
        notificationDropdown.classList.toggle("show");
        if (notificationDropdown.classList.contains("show")) {
            notificationDropdown.innerHTML = ""; // Clear existing notifications
            await fetchAndDisplayNotifications(); // Fetch all notifications
        }
    });

    // Hide the dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!notificationIcon.contains(event.target)) {
            notificationDropdown.classList.remove("show");
        }
    });

    // Add event listener for theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.addEventListener("change", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });

    // Set the initial theme based on localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
    themeToggle.checked = savedTheme === "dark";

    // Add event listener to user icon to toggle sidebar
    document.getElementById("user-icon").addEventListener("click", async (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the document
        await populateUserSidebar("user-sidebar");
    });

    // Hide the sidebar when clicking outside
    document.addEventListener("click", (event) => {
        const userSidebar = document.getElementById("user-sidebar");
        if (userSidebar && !userSidebar.contains(event.target) && !event.target.matches('.user-icon, .user-icon *')) {
            userSidebar.classList.remove("show");
        }
    });
}

export function setNickname(newNickname) {
    document.getElementById("nickname").textContent = newNickname;
    localStorage.setItem("nickname", newNickname);
}

export function getNickname() {
    return localStorage.getItem("nickname");
}

export async function updateNavMenu() {
    try {
        const response = await fetch("/auth/is-logged-in");
        if (response.ok) {
            const data = await response.json();
            if (data.status === "logged_in") {
                isLoggedIn = true;
                document.getElementById("toggle-login").hidden = true;
                document.getElementById("toggle-signup").hidden = true;
                document.getElementById("logout-btn").hidden = false;
                document.getElementById("logout-btn").disabled = false; // Enable logout button
                document.getElementById("chat-btn").hidden = false; // Show chat button
                document.querySelector(".notification-icon").hidden = false; // Show bell icon
                document.getElementById("user-icon").hidden = false; // Show user icon
                document.getElementById("nickname").textContent = data.nickname;
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("nickname", data.nickname);
                localStorage.setItem("sessionID", data.sessionID);
                localStorage.setItem("userId", data.userId); // Ensure userId is set
                await fetchAndDisplayNotifications(); // Fetch notifications on login
            } else {
                document.getElementById("toggle-login").hidden = false;
                document.getElementById("toggle-signup").hidden = false;
                document.getElementById("logout-btn").hidden = true;
                document.getElementById("logout-btn").disabled = true; // Disable logout button
                document.querySelector(".notification-icon").hidden = true; // Hide bell icon
                document.getElementById("user-icon").hidden = true; // Hide user icon
                document.getElementById("chat-btn").hidden = true; // Hide chat button
                document.getElementById("nickname").textContent = "";
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("nickname");
                localStorage.removeItem("sessionID");
                localStorage.removeItem("userId"); // Ensure userId is removed
            }
            // Dispatch a custom event to notify the index page
            const event = new CustomEvent("loginStatusUpdate", {
                detail: { isLoggedIn },
            });
            window.dispatchEvent(event);
        } else if (response.status === 401) {
            document.getElementById("toggle-login").hidden = false;
            document.getElementById("toggle-signup").hidden = false;
            document.getElementById("logout-btn").hidden = true;
            document.getElementById("logout-btn").disabled = true; // Disable logout button
            document.querySelector(".notification-icon").hidden = true; // Hide bell icon
            document.getElementById("user-icon").hidden = true; // Hide user icon
            document.getElementById("chat-btn").hidden = true; // Hide chat button
            document.getElementById("nickname").textContent = "";
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("nickname");
            localStorage.removeItem("sessionID");
            localStorage.removeItem("userId"); // Ensure userId is removed
            // Dispatch a custom event to notify the index page
            const event = new CustomEvent("loginStatusUpdate", {
                detail: { isLoggedIn: false },
            });
            window.dispatchEvent(event);
        } else {
            console.error("Error updating nav menu:", response.status);
        }
    } catch (error) {
        console.error("Failed to update navigation menu:", error);
    }
}

export function handleChatNotification(message) {
    const currentUserId = parseInt(localStorage.getItem('userId'));
    if (message.receiverId === currentUserId) {
        const notificationMessage = `New message from ${message.senderNickname}: ${message.content}`;
        updateNotificationCounter(1, true);
        // Show a toast notification instead of adding to dropdown
        showNotification(notificationMessage);
    }
}

// Function to show a toast notification
function showNotification(message) {
    let toastNotification = document.querySelector(".toast-notification");
    const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message; // Truncate message to 20 chars

    if (toastNotification) {
        // If a toast already exists, update its message and reset the timer
        toastNotification.textContent = truncatedMessage;
        toastNotification.classList.add("show"); // Ensure it is visible
        clearTimeout(toastNotification.timeoutId); // Clear the previous timeout
        toastNotification.timeoutId = setTimeout(() => {
            toastNotification.remove();
        }, 5000); // 5000ms = 5 seconds
    } else {
        // Create a new toast notification element
        toastNotification = document.createElement("div");
        toastNotification.className = "toast-notification show"; // Add the show class to trigger the animation
        toastNotification.textContent = truncatedMessage;

        // Add the toast notification to the body
        document.body.appendChild(toastNotification);

        // Set a timer to remove the toast notification after some time
        toastNotification.timeoutId = setTimeout(() => {
            toastNotification.remove();
        }, 5000); // 5000ms = 5 seconds
    }
}