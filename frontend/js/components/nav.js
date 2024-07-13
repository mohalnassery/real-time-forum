import { fetchNotifications, clearNotification, markAllNotificationsAsRead } from './notifications.js';
import { logout } from './auth/auth_handling.js';

export function createNavBar(navbar) {
    navbar.innerHTML = `
        <div class="header">
            <a href="/">
                <img src="/assets/logo.png" alt="Logo" class="logo" style="height: 50px; width: auto;">
            </a>
            <div class="user-auth">
                <div class="notification-icon" hidden>
                    <i class="fa-solid fa-bell"></i>
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
            </div>
        </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", async () => {
        await logout();
    });

    // Add event listener to nickname element to redirect to activity page
    document.getElementById("nickname").addEventListener("click", () => {
        window.location.href = "/activity.html";
    });


    // Add "Mark all as read" button
    const notificationIcon = document.getElementsByClassName("notification-icon")[0]
    const notificationDropdown = document.getElementsByClassName("notification-dropdown")[0]
    document.getElementsByClassName("mark-all-read")[0].addEventListener("click", async () => {
        await markAllNotificationsAsRead();
        notificationDropdown.innerHTML = "";
    });

    // Add event listener to toggle dropdown visibility and fetch notifications
    notificationIcon.addEventListener("click", async (event) => {
        event.stopPropagation();
        notificationDropdown.classList.toggle("show");
        if (notificationDropdown.classList.contains("show")) {
            const notifications = await fetchNotifications();
            notificationDropdown.innerHTML = "";
            notifications.forEach((notification) => {
                const item = document.createElement("div");
                item.className = "notification-item";
                item.textContent = notification.message;
                item.addEventListener("click", async () => {
                    await clearNotification(notification.id);
                    item.remove();
                });
                notificationDropdown.appendChild(item);
            });
        }
    });

    // Hide the dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!notificationIcon.contains(event.target)) {
            notificationDropdown.classList.remove("show");
        }
    });
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
                document.querySelector(".notification-icon").hidden = false; // Show bell icon
                document.getElementById("nickname").textContent = data.nickname;
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("nickname", data.nickname);
                localStorage.setItem("sessionID", data.sessionID);
            } else {
                document.getElementById("toggle-login").hidden = false;
                document.getElementById("toggle-signup").hidden = false;
                document.getElementById("logout-btn").hidden = true;
                document.getElementById("logout-btn").disabled = true; // Disable logout button
                document.querySelector(".notification-icon").hidden = true; // Hide bell icon
                document.getElementById("nickname").textContent = "";
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("nickname");
                localStorage.removeItem("sessionID");
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
            document.getElementById("nickname").textContent = "";
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("nickname");
            localStorage.removeItem("sessionID");
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

document.addEventListener("DOMContentLoaded", () => {
    updateNavMenu();
});
