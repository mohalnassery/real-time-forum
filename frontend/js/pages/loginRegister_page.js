import { handleRegister, handleLogin } from '../components/auth/loginRegister.js';

export function initAuth(parentElement, showLogin = true) {
    const authContainer = document.createElement("div");
    authContainer.id = "auth";
    authContainer.className = "auth-container";

    if (showLogin) {
        document.getElementById('toggle-login').disabled = true;
        document.getElementById('toggle-signup').disabled = false;
    } else {
        document.getElementById('toggle-login').disabled = false;
        document.getElementById('toggle-signup').disabled = true;
    }

    const registerForm = `
        <div class="form-container" id="register-form" style="display: ${showLogin ? 'none' : 'flex'};">
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
            <a href="#" id="switch-to-login">already have an account?</a>
        </div>
    `;

    const loginForm = `
        <div class="form-container" id="login-form" style="display: ${showLogin ? 'flex' : 'none'};">
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
            <a href="#" id="switch-to-signup">Create a new account</a>
        </div>
    `;

    authContainer.innerHTML = registerForm + loginForm;
    parentElement.innerHTML = ''; // Clear any existing content
    parentElement.appendChild(authContainer);

    // Add event listeners for form submissions
    document.querySelector('.register-form').addEventListener('submit', handleRegister);
    document.querySelector('.login-form').addEventListener('submit', handleLogin);

    // Add event listeners for toggling forms
    document.getElementById('toggle-login').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'flex';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('toggle-login').disabled = true;
        document.getElementById('toggle-signup').disabled = false;
    });

    document.getElementById('toggle-signup').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'flex';
        document.getElementById('toggle-login').disabled = false;
        document.getElementById('toggle-signup').disabled = true;
    });

    // Add event listeners for switching forms
    const switchToLoginElement = document.getElementById('switch-to-login');
    if (switchToLoginElement) {
        switchToLoginElement.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'flex';
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('toggle-login').disabled = true;
            document.getElementById('toggle-signup').disabled = false;
        });
    }

    const switchToSignupElement = document.getElementById('switch-to-signup');
    if (switchToSignupElement) {
        switchToSignupElement.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'flex';
            document.getElementById('toggle-login').disabled = false;
            document.getElementById('toggle-signup').disabled = true;
        });
    }
}
