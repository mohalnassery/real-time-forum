import { createNavBar, updateNavMenu } from './components/nav.js';
import { initAuth } from './pages/loginRegister_page.js';
import { initContent } from './pages/home_page.js';
import { initPostDetails } from './pages/postDetails_page.js';
import { initCreatePost } from './pages/createPost_page.js';
import { loadCSS, unloadCSS } from './components/utils.js'; // Ensure this import is correct

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
        loadCSS('./css/components/nav.css');
        loadCSS('./css/pages/login-register.css');
    } else {
        // Initialize content for logged-in users
        initContent(mainContent);
        loadCSS('./css/pages/create-post.css');
        console.log("csss")
        loadCSS('./css/pages/home.css');
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

    // Unload all dynamic CSS files
    unloadCSS('./css/pages/login-register.css');
    unloadCSS('./css/pages/home.css');
    unloadCSS('./css/pages/create-post.css');
    unloadCSS('./css/pages/post-details.css');

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