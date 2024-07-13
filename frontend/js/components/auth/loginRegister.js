import { updateNavMenu } from '../nav.js';

export async function handleLogin(event) {
    event.preventDefault();
    const nicknameOrEmail = document.getElementById("loginNicknameOrEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nicknameOrEmail, password })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        // Update the navigation menu to reflect the logged-in status
        await updateNavMenu();

        // Redirect to the main page
        window.location.href = '/';
    } catch (error) {
        document.getElementById("login-error").innerText = error.message;
    }
}

export async function handleRegister(event) {
    event.preventDefault();
    const nickname = document.getElementById("register_nickname").value;
    const email = document.getElementById("register_email").value;
    const password = document.getElementById("register_password").value;
    const confirmPassword = document.getElementById("register_confirm_password").value;
    const age = parseInt(document.getElementById("register_age").value, 10);
    const gender = document.getElementById("register_gender").value;
    const firstName = document.getElementById("register_firstName").value;
    const lastName = document.getElementById("register_lastName").value;

    if (password !== confirmPassword) {
        document.getElementById("register-error").innerText = "Passwords do not match.";
        return;
    }

    try {
        const res = await fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nickname, email, password, age, gender, firstName, lastName })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        window.location.href = '/';
    } catch (error) {
        document.getElementById("register-error").innerText = error.message;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".register-form").addEventListener("submit", handleRegister);
    document.querySelector(".login-form").addEventListener("submit", handleLogin);
});
