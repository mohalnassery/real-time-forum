import { createNavBar, updateNavMenu } from "./components/nav.js";
import { initAuth } from "./pages/loginRegister_page.js";
import { initContent } from "./pages/home_page.js";
import { initPostDetails } from "./pages/postDetails_page.js";
import { initCreatePost } from "./pages/createPost_page.js";
import { loadCSS } from "./components/utils.js";
import {
  initWebSocket,
  sendChatClosed,
} from "./components/websocket/websocket.js";
import { initProfilePage } from "./pages/profile_page.js";
import { initChatPage } from "./pages/chat_page.js"; // Import the chat page initialization function
import { createUserSidebar } from "./components/websocket/chat_box.js";

// Event listener for DOMContentLoaded to initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  const navbar = document.getElementById("navbar");
  createNavBar(navbar);

  try {
    await updateNavMenu();
  } catch (error) {
    console.error("Error updating nav menu:", error);
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    initWebSocket(localStorage.getItem("userId"));
    createUserSidebar();
  }

  window.addEventListener("hashchange", handleNavigation);
  handleNavigation(); // Initial navigation handling
});

let isNavigating = false; // Flag to prevent multiple navigation calls

async function handleNavigation() {
  if (isNavigating) return; // Prevent multiple calls
  isNavigating = true; // Set navigating flag

  const mainContent = document.getElementById("main-content");
  const hash = window.location.hash; // Get the current hash
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Check login status

  if (!isLoggedIn) {
    initAuth(mainContent);
    loadCSS("./css/pages/login-register.css"); // Load CSS for login page
    isNavigating = false; // Reset navigating flag
    return;
  }

  try {
    sendChatClosed(0); // Close any open chat
    // Handle different hash routes
    if (hash === "#home" || hash === "") {
      // Handle home page
      initContent(mainContent); // Default to home content
      loadCSS("./css/pages/home.css"); // Load CSS for home
    } else if (hash.startsWith("#post/")) {
      const postId = hash.split("/")[1]; // Extract post ID from hash
      await initPostDetails(mainContent, postId); // Initialize post details
      loadCSS("./css/pages/post-details.css"); // Load CSS for post details
    } else if (hash === "#create-post") {
      initCreatePost(mainContent); // Initialize create post page
      loadCSS("./css/pages/create-post.css"); // Load CSS for create post
    } else if (hash.startsWith("#profile")) {
      // Handle profile page
      const urlParams = new URLSearchParams(hash.split("?")[1]);
      const userID = urlParams.get("user_id"); // Get user ID from URL
      if (userID) {
        initProfilePage(mainContent, userID); // Initialize profile page
        loadCSS("./css/pages/profile.css"); // Load CSS for profile
      } else {
        throw new Error("User ID is missing in the URL");
      }
    } else if (hash === "#chat") {
      // Handle chat page
      await initChatPage(mainContent); // Initialize chat page
      loadCSS("./css/pages/chat.css"); // Load CSS for chat
    } else {
      throw new Error("Page not found"); // Handle unknown routes
    }

    // Check for custom 404 header
    const response = await fetch(window.location.href);
    if (response.headers.get("X-Custom-Status") === "404") {
      throw new Error("Page not found");
    }
  } catch (error) {
    console.error("Error handling navigation:", error); // Log any errors
    await displayErrorPage(mainContent, error.message, error.name === "Error" ? 404 : 500); // Display error page with status
  }

  isNavigating = false; // Reset navigating flag
}

// Function to display an error page and then navigate to home
async function displayErrorPage(mainContent, errorMessage, errorCode) {
  mainContent.innerHTML = `
    <div class="error-container">
      <h1>Error ${errorCode}</h1>
      <p>${errorMessage}</p>
      <p>Redirecting to home page...</p>
    </div>
  `;
  loadCSS("./css/pages/error.css");

  // Wait for 3 seconds before navigating to home
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Navigate to home page content
  initContent(mainContent);
  loadCSS("./css/pages/home.css");

  // Update the URL to the root path without triggering a page reload
  history.pushState("", document.title, "/");
}