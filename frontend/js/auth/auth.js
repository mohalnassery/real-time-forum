export function initAuth(app) {
    const authContainer = document.createElement("div");
    authContainer.id = "auth";
    authContainer.style.display = "flex";
    authContainer.style.flexDirection = "column";
    authContainer.style.alignItems = "center";
    authContainer.style.justifyContent = "center";
    authContainer.style.height = "100vh";
    authContainer.style.backgroundColor = "#f8f8f8";

    const header = `
        <div class="header">
            <a href="/">
                <img src="/assets/logo.png" alt="Logo" class="logo" style="height: 50px; width: auto;">
            </a>
            <div class="user-auth">
                <a href="/login" class="auth-links">
                    <button class="link-buttons" id="login-btn">Login</button>
                </a>
                <a href="/register" class="auth-links">
                    <button class="link-buttons" id="signup-btn">SignUp</button>
                </a>
            </div>
        </div>
    `;

    const registerForm = `
        <div class="register-container">
            <div class="form-container">
                <h1>Register</h1>
                <form class="register-form">
                    <div class="input-container">
                        <i class="fas fa-user"></i>
                        <input type="text" class="form-input" id="register_nickname" placeholder="Nickname" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-envelope"></i>
                        <input type="email" class="form-input" id="register_email" placeholder="Email" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-lock"></i>
                        <input type="password" class="form-input" id="register_password" placeholder="Password" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-calendar"></i>
                        <input type="number" class="form-input" id="register_age" placeholder="Age" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-venus-mars"></i>
                        <input type="text" class="form-input" id="register_gender" placeholder="Gender" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-user"></i>
                        <input type="text" class="form-input" id="register_firstName" placeholder="First Name" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-user"></i>
                        <input type="text" class="form-input" id="register_lastName" placeholder="Last Name" required>
                    </div>
                    <div class="error-container" id="register-error"></div>
                    <button type="submit">Register</button>
                    <div class="social-login">
                        <a href="/auth/google" class="google-login">
                            <i class="fab fa-google"></i>
                            Google
                        </a>
                        <a href="/auth/github" class="github-login">
                            <i class="fab fa-github"></i>
                            GitHub
                        </a>
                        <a href="/auth/facebook" class="facebook-login">
                            <i class="fab fa-facebook"></i>
                            Facebook
                        </a>
                    </div>
                </form>
                <a href="/login">already have an account?</a>
            </div>
            <img src="./assets/Wavy_Tech-28_Single-10-min.jpg" alt="register image">
        </div>
    `;

    const loginForm = `
        <div class="login-container">
            <div class="form-container">
                <h1>Sign In</h1>
                <form class="login-form">
                    <div class="input-container">
                        <i class="fas fa-user"></i>
                        <input type="text" class="form-input" id="loginNicknameOrEmail" placeholder="Nickname or Email" required>
                    </div>
                    <div class="input-container">
                        <i class="fas fa-lock"></i>
                        <input type="password" class="form-input" id="loginPassword" placeholder="Password" required>
                    </div>
                    <div class="social-login">
                        <a href="/auth/google" class="google-login">
                            <i class="fab fa-google"></i>
                            Google
                        </a>
                        <a href="/auth/github" class="github-login">
                            <i class="fab fa-github"></i>
                            GitHub
                        </a>
                        <a href="/auth/facebook" class="facebook-login">
                            <i class="fab fa-facebook"></i>
                            Facebook
                        </a>
                    </div>
                    <div class="error-container" id="login-error"></div>
                    <button type="submit">Sign In</button>
                </form>
                <a href="/register">Create a new account</a>
            </div>
            <img src="./assets/undraw_Access_account_re_8spm.png" alt="login image">
        </div>
    `;

    authContainer.innerHTML = header + registerForm + loginForm;
    app.appendChild(authContainer);

    // Add event listeners for form submissions
    document.querySelector('.register-form').addEventListener('submit', handleRegister);
    document.querySelector('.login-form').addEventListener('submit', handleLogin);
}

async function handleRegister(event) {
    event.preventDefault();
    const nickname = document.getElementById("register_nickname").value;
    const email = document.getElementById("register_email").value;
    const password = document.getElementById("register_password").value;
    const age = parseInt(document.getElementById("register_age").value, 10);
    const gender = document.getElementById("register_gender").value;
    const firstName = document.getElementById("register_firstName").value;
    const lastName = document.getElementById("register_lastName").value;

    // Debugging: Check if elements are correctly selected
    console.log("Nickname:", nickname);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Age:", age);
    console.log("Gender:", gender);
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);

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

async function handleLogin(event) {
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

        window.location.href = '/';
    } catch (error) {
        document.getElementById("login-error").innerText = error.message;
    }
}