import { fetchAndDisplayNotifications, markAllNotificationsAsRead, updateNotificationCounter, showNotification } from './notifications.js';
import { logout } from './auth/auth_handling.js';
import { populateUserSidebar } from './websocket/chat_box.js'; // Import the function

let isLoggedIn = false; // Variable to track login status

// Function to create the navigation bar
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
                        <div class="mark-all-read"></div>
                    </div>
                </div>
                <button class="link-buttons" id="toggle-login" hidden disabled >Login</button>
                <button class="link-buttons" id="toggle-signup" hidden disabled >SignUp</button>
                <button class="link-buttons" id="logout-btn" hidden disabled >LogOut</button>
                <div class="user-info" display="none">
                    <p id="nickname"></p>
                </div>
                <div class="user-icon" id="user-icon" hidden>
                    <i class="fa-solid fa-users"></i>
                </div>
                <button class="link-buttons" id="chat-btn" hidden>Chat</button>
            </div>
        </div>
    `;

    // Event listener for logout button
    document.getElementById("logout-btn").addEventListener("click", async () => {
        await logout();
    });

    // Event listener for logo click to reset the hash
    document.getElementById("logo").addEventListener("click", () => {
        window.location.hash = "";
    });

    // Event listener for chat button to toggle chat box
    document.getElementById("chat-btn").addEventListener("click", () => {
        const chatBox = document.querySelector(".chat-box");
        if (chatBox) {
            chatBox.classList.toggle("show");
        }
        window.location.hash = "#chat";
    });
    
    const chatSendButton = document.getElementById('chat-send-button');
    const chatMessageInput = document.getElementById('chat-message-input');

    // Event listener for sending messages via button click
    if (chatSendButton) {
        chatSendButton.addEventListener('click', () => sendMessageHandler('chat-messages'));
    }

    // Event listener for sending messages via Enter key
    if (chatMessageInput) {
        chatMessageInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessageHandler('chat-messages');
            }
        });
    }

    // Event listener to redirect to profile page when nickname is clicked
    document.getElementById("nickname").addEventListener("click", async () => {
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

    // Add "Mark all as read" button functionality
    const notificationIcon = document.getElementsByClassName("notification-icon")[0];
    const notificationDropdown = document.getElementsByClassName("notification-dropdown")[0];
    document.getElementsByClassName("mark-all-read")[0].addEventListener("click", async () => {
        await markAllNotificationsAsRead();
        notificationDropdown.innerHTML = ""; // Clear notifications after marking as read
        updateNotificationCounter(0); // Reset counter
    });

    // Event listener to toggle notification dropdown visibility and fetch notifications
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

    // Event listener for theme toggle
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

    // Event listener to toggle user sidebar
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

// Function to set the user's nickname
export function setNickname(newNickname) {
    document.getElementById("nickname").textContent = newNickname;
    localStorage.setItem("nickname", newNickname);
}

// Function to get the user's nickname
export function getNickname() {
    return localStorage.getItem("nickname");
}

// Function to update the navigation menu based on login status
export async function updateNavMenu() {
    try {
        const response = await fetch("/auth/is-logged-in");
        if (response.ok) {
            const data = await response.json();
            // Update the navigation menu based on login status
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