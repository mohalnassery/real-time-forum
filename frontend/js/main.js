import { createNavBar, updateNavMenu } from './components/nav.js';
import { initAuth } from './pages/loginRegister_page.js';
import { initContent } from './pages/home_page.js';
import { initPostDetails } from './pages/postDetails_page.js';
import { initCreatePost } from './pages/createPost_page.js';
import { loadCSS } from './components/utils.js';
import { initWebSocket } from './components/websocket/websocket.js';

document.addEventListener("DOMContentLoaded", async () => {
    const navbar = document.getElementById("navbar");
    const mainContent = document.getElementById("main-content");

    console.log("DOMContentLoaded");

    // Create and append the navigation bar
    createNavBar(navbar);

    // Update the navigation menu to reflect the current login status
    try {
        await updateNavMenu();
    } catch (error) {
        console.error("Error updating nav menu:", error);
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
        // Initialize authentication (login/register)
        initAuth(mainContent);
        loadCSS('./css/pages/login-register.css');
    } else {
        // Initialize content for logged-in users
        initContent(mainContent);
        loadCSS('./css/pages/home.css');
        // Initialize WebSocket connection
        initWebSocket();
    }

    // Handle navigation
    window.addEventListener("hashchange", handleNavigation);
    handleNavigation();
});

let isNavigating = false;

async function handleNavigation() {
    if (isNavigating) return;
    isNavigating = true;

    console.log("handleNavigation");

    const mainContent = document.getElementById("main-content");
    const hash = window.location.hash;
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
        initAuth(mainContent);
        loadCSS('./css/pages/login-register.css');
        isNavigating = false;
        return;
    }

    try {
        if (hash.startsWith("#post/")) {
            const postId = hash.split("/")[1];
            await initPostDetails(mainContent, postId);
            loadCSS('./css/pages/post-details.css');
        } else if (hash === "#create-post") {
            await initCreatePost(mainContent);
            loadCSS('./css/pages/create-post.css');
        } else {
            await initContent(mainContent);
            loadCSS('./css/pages/home.css');
        }
    } catch (error) {
        console.error("Error handling navigation:", error);
    }

    isNavigating = false;
}