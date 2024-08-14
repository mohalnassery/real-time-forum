import { createNavBar, updateNavMenu } from './components/nav.js';
import { initAuth } from './pages/loginRegister_page.js';
import { initContent } from './pages/home_page.js';
import { initPostDetails } from './pages/postDetails_page.js';
import { initCreatePost } from './pages/createPost_page.js';
import { loadCSS } from './components/utils.js';
import { initWebSocket, sendChatClosed } from './components/websocket/websocket.js';
import { initProfilePage } from './pages/profile_page.js';
import { initChatPage } from './pages/chat_page.js'; // Import the chat page initialization function
import { createUserSidebar } from './components/websocket/chat_box.js';

document.addEventListener("DOMContentLoaded", async () => {
    const navbar = document.getElementById("navbar");

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

    if (isLoggedIn) {
        initWebSocket(localStorage.getItem("userId")); 
        createUserSidebar();
    }

    // Handle navigation
    window.addEventListener("hashchange", handleNavigation);
    handleNavigation();
});

let isNavigating = false;

async function handleNavigation() {
    if (isNavigating) return;
    isNavigating = true;

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
        sendChatClosed(0);
        if (hash.startsWith("#post/")) {
            const postId = hash.split("/")[1];
            await initPostDetails(mainContent, postId);
            loadCSS('./css/pages/post-details.css');
        } else if (hash === "#create-post") {
            initCreatePost(mainContent);
            loadCSS('./css/pages/create-post.css');
        } else if (hash.startsWith("#profile")) { // Adjust condition for profile page
            const urlParams = new URLSearchParams(hash.split('?')[1]);
            const userID = urlParams.get('user_id');
            if (userID) {
                initProfilePage(mainContent, userID);
                loadCSS('./css/pages/profile.css');
            } else {
                console.error("User ID is missing in the URL");
            }
        } else if (hash === "#chat") { // Add this condition for chat page
            await initChatPage(mainContent);
            loadCSS('./css/pages/chat.css');
        } else {
            initContent(mainContent);
            loadCSS('./css/pages/home.css');
        }
    } catch (error) {
        console.error("Error handling navigation:", error);
    }

    isNavigating = false;
}