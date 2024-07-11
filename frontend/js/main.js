import { createNavBar } from './nav/nav.js';
import { showSection } from './auth/utils.js';
import { initAuth } from './auth/auth.js';
import { initContent } from './content/content.js';

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");

    // Create and append the navigation bar
    createNavBar();

    // Initialize authentication (login/register)
    initAuth(app);

    // Initialize main content
    initContent(app);

    // Show the login section by default
    showSection('login');
});
