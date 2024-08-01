import { fetchAndDisplayNotifications, clearNotification, markAllNotificationsAsRead } from './notifications.js';
import { logout } from './auth/auth_handling.js';
import { createUserSidebar } from '../components/websocket/messages.js';

export function createNavBar(navbar) {
    navbar.innerHTML = `
        <div class="header">
            <a href="/">
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

    document.getElementById("chat-btn").addEventListener("click", () => {
        const chatBox = document.getElementById("chat-box");
        if (chatBox) {
            chatBox.hidden = !chatBox.hidden;
        }
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
            console.log("data", data);
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
            await fetchAndDisplayNotifications();
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

    // Initialize the user sidebar
    createUserSidebar();

    // Add event listener to user icon to toggle sidebar
    document.getElementById("user-icon").addEventListener("click", () => {
        document.getElementById("user-sidebar").classList.toggle("show");
    });

    // Close sidebar when clicking outside of it
    document.addEventListener("click", (event) => {
        const sidebar = document.getElementById("user-sidebar");
        if (sidebar.classList.contains("show") && !sidebar.contains(event.target) && !event.target.matches('.user-icon, .user-icon *')) {
            sidebar.classList.remove("show");
        }
    });

    // Add event listener to chat button to navigate to chat page
    document.getElementById("chat-btn").addEventListener("click", () => {
        window.location.hash = "#chat";
    });
}

export function setNickname(newNickname) {
    document.getElementById("nickname").textContent = newNickname;
    localStorage.setItem("nickname", newNickname);
}

export function getNickname() {
    return localStorage.getItem("nickname");
}

let isLoggedIn = false; // Variable to track login status

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

export function updateNotificationCounter(count) {
    const counterElement = document.getElementById("notification-counter");
    if (count > 0) {
        counterElement.textContent = count > 99 ? "99+" : count;
        counterElement.hidden = false;
    } else {
        counterElement.hidden = true;
    }
}

