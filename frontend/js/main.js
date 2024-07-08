import { createNavBar } from './nav.js';
import { showSection } from './utils.js';
import { initAuth } from './auth.js';
import { initContent } from './content.js';

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");

    // Create and append the navigation bar
    const navBar = createNavBar();
    app.appendChild(navBar);

    // Initialize authentication (login/register)
    initAuth(app);

    // Initialize main content
    initContent(app);

    // Show the login section by default
    showSection('login');
});