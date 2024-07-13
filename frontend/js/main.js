import { createNavBar, updateNavMenu } from './nav/nav.js';
import { initAuth } from './auth/auth.js';
import { initContent } from './content/content.js';
import { initPostDetails } from './content/postDetails.js';
import { initCreatePost } from './content/createPost.js';

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
        isNavigating = false;
        return;
    }

    try {
        if (hash.startsWith("#post/")) {
            const postId = hash.split("/")[1];
            await initPostDetails(mainContent, postId);
        } else if (hash === "#create-post") {
            await initCreatePost(mainContent);
        } else {
            await initContent(mainContent);
        }
    } catch (error) {
        console.error("Error handling navigation:", error);
    }

    isNavigating = false;
}