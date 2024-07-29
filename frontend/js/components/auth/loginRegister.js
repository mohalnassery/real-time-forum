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
    const dob = document.getElementById("register_dob").value;
    const gender = document.getElementById("register_gender").value;
    const first_name = document.getElementById("register_first_name").value;
    const last_name = document.getElementById("register_last_name").value;

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
            body: JSON.stringify({ nickname, email, password, dob, gender, first_name, last_name })
        });

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }

        const data = await res.json(); // Get the response data
        localStorage.setItem("userId", data.userId); // Set the userId in localStorage

        await updateNavMenu();
        window.location.href = '/';
    } catch (error) {
        document.getElementById("register-error").innerText = error.message;
    }
}
