import { fetchNotifications, clearNotification, markAllNotificationsAsRead } from './notifications.mjs';
import { logout } from './auth/auth_handling.js';

export function createNavBar() {
    const style = document.createElement("style");

    document.head.appendChild(style);

    const header = document.createElement("div");
    header.className = "header";
    const headerLink = document.createElement("a");
    headerLink.href = "/";
    header.appendChild(headerLink);
    const logo = document.createElement("img");
    logo.src = "/assets/logo.png";
    logo.alt = "Logo";
    logo.className = "logo";
    logo.style.height = "50px";
    logo.style.width = "auto";
    headerLink.appendChild(logo);
    const userAuth = document.createElement("div");
    userAuth.className = "user-auth";

    // Add bell icon for notifications (initially hidden)
    const notificationIcon = document.createElement("div");
    notificationIcon.className = "notification-icon";
    notificationIcon.style.display = "none"; // Hide by default
    const bellIcon = document.createElement("i");
    bellIcon.className = "fa-solid fa-bell";
    notificationIcon.appendChild(bellIcon);
    userAuth.appendChild(notificationIcon);

    // Create dropdown menu for notifications
    const notificationDropdown = document.createElement("div");
    notificationDropdown.className = "notification-dropdown";
    notificationIcon.appendChild(notificationDropdown);

    // Add "Mark all as read" button
    const markAllRead = document.createElement("div");
    markAllRead.className = "mark-all-read";
    markAllRead.textContent = "Mark all as read";
    markAllRead.addEventListener("click", async () => {
        await markAllNotificationsAsRead();
        notificationDropdown.innerHTML = "";
    });
    notificationDropdown.appendChild(markAllRead);

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

    const loginLink = document.createElement("a");
    loginLink.href = "/login";
    loginLink.className = "auth-links";
    const loginButton = document.createElement("button");
    loginButton.className = "link-buttons";
    loginButton.id = "login-btn";
    loginButton.textContent = "Login";
    loginLink.appendChild(loginButton);
    userAuth.appendChild(loginLink);
    const signupLink = document.createElement("a");
    signupLink.href = "/register";
    signupLink.className = "auth-links";
    const signupButton = document.createElement("button");
    signupButton.className = "link-buttons";
    signupButton.id = "signup-btn";
    signupButton.textContent = "SignUp";
    signupLink.appendChild(signupButton);
    userAuth.appendChild(signupLink);
    const logoutButton = document.createElement("button");
    logoutButton.id = "logout-btn";
    logoutButton.className = "link-buttons";
    logoutButton.style.display = "none";
    logoutButton.textContent = "Logout";
    logoutButton.addEventListener("click", async () => {
        await logout();
    });
    userAuth.appendChild(logoutButton);
    const userInfo = document.createElement("div");
    userInfo.className = "user-info";
    const usernameElement = document.createElement("p");
    usernameElement.id = "nickname";
    userInfo.appendChild(usernameElement);
    userAuth.appendChild(userInfo);
    header.appendChild(userAuth);
    document.body.insertBefore(header, document.body.firstChild);

    // Add event listener to nickname element to redirect to activity page
    usernameElement.addEventListener("click", () => {
        window.location.href = "/activity.html";
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
                document.getElementById("login-btn").style.display = "none";
                document.getElementById("signup-btn").style.display = "none";
                document.getElementById("logout-btn").style.display = "inline-block";
                document.querySelector(".notification-icon").style.display = "inline-block"; // Show bell icon
                document.getElementById("nickname").textContent = data.nickname;
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("nickname", data.nickname);
                localStorage.setItem("sessionID", data.sessionID);
            } else {
                document.getElementById("login-btn").style.display = "inline-block";
                document.getElementById("signup-btn").style.display = "inline-block";
                document.getElementById("logout-btn").style.display = "none";
                document.querySelector(".notification-icon").style.display = "none"; // Hide bell icon
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
            document.getElementById("login-btn").style.display = "inline-block";
            document.getElementById("signup-btn").style.display = "inline-block";
            document.getElementById("logout-btn").style.display = "none";
            document.querySelector(".notification-icon").style.display = "none"; // Hide bell icon
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


