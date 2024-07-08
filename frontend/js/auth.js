import { showSection } from './utils.js';

export function initAuth(app) {
    const authContainer = document.createElement("div");
    authContainer.id = "auth";
    authContainer.innerHTML = `
        <div id="register" class="auth-section">
            <h2>Register</h2>
            <form class="register-form">
                <div class="input-container">
                    <i class="fas fa-user"></i>
                    <input type="text" class="form-input" id="nickname" placeholder="Nickname" required>
                </div>
                <div class="input-container">
                    <i class="fas fa-envelope"></i>
                    <input type="email" class="form-input" id="email" placeholder="Email" required>
                </div>
                <div class="input-container">
                    <i class="fas fa-lock"></i>
                    <input type="password" class="form-input" id="password" placeholder="Password" required>
                </div>
                <div class="error-container" id="register-error"></div>
                <button type="submit">Register</button>
            </form>
        </div>

        <div id="login" class="auth-section" style="display: none;">
            <h2>Login</h2>
            <form class="login-form">
                <div class="input-container">
                    <i class="fas fa-user"></i>
                    <input type="text" class="form-input" id="login-nickname" placeholder="Nickname or Email" required>
                </div>
                <div class="input-container">
                    <i class="fas fa-lock"></i>
                    <input type="password" class="form-input" id="login-password" placeholder="Password" required>
                </div>
                <div class="error-container" id="login-error"></div>
                <button type="submit">Login</button>
            </form>
        </div>
    `;
    app.appendChild(authContainer);

    // Add event listeners for forms
    document.querySelector(".register-form").addEventListener("submit", handleRegister);
    document.querySelector(".login-form").addEventListener("submit", handleLogin);
}

async function handleRegister(event) {
    event.preventDefault();
    const nickname = document.getElementById("nickname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nickname, email, password })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        showSection('mainContent');
    } catch (error) {
        document.getElementById("register-error").innerText = error.message;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const nickname = document.getElementById("login-nickname").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nickname, password })
        });
        // log the nickname and password passed
        console.log(nickname, password);


        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        showSection('mainContent');
    } catch (error) {
        document.getElementById("login-error").innerText = error.message;
    }
}