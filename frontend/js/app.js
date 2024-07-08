document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const createPostForm = document.getElementById("createPostForm");
    const sendMessageForm = document.getElementById("sendMessageForm");

    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const nickname = document.getElementById("nickname").value;
        const age = parseInt(document.getElementById("age").value, 10); // Convert age to integer
        const gender = document.getElementById("gender").value;
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nickname, age, gender, firstName, lastName, email, password })
        })
        .then(response => {
            if (response.headers.get("Content-Type").includes("application/json")) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text); });
            }
        })
        .then(data => {
            if (data.success) {
                alert("Registration successful!");
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => {
            alert("Registration failed: " + error.message);
        });
    });

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const nicknameOrEmail = document.getElementById("loginNicknameOrEmail").value;
        const password = document.getElementById("loginPassword").value;

        fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nicknameOrEmail, password })
        })
        .then(response => {
            if (response.headers.get("Content-Type").includes("application/json")) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text); });
            }
        })
        .then(data => {
            if (data.success) {
                alert("Login successful!");
                document.getElementById("auth").style.display = "none";
                document.getElementById("mainContent").style.display = "block";
            } else {
                alert("Login failed: " + data.message);
            }
        })
        .catch(error => {
            alert("Login failed: " + error.message);
        });
    });

    createPostForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const title = document.getElementById("postTitle").value;
        const content = document.getElementById("postContent").value;

        fetch("/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        })
        .then(response => {
            if (response.headers.get("Content-Type").includes("application/json")) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text); });
            }
        })
        .then(data => {
            if (data.success) {
                alert("Post created successfully!");
                loadPosts();
            } else {
                alert("Failed to create post: " + data.message);
            }
        })
        .catch(error => {
            alert("Failed to create post: " + error.message);
        });
    });

    sendMessageForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const recipient = document.getElementById("messageRecipient").value;
        const content = document.getElementById("messageContent").value;

        sendMessage({ recipient, content });
    });

    function loadPosts() {
        fetch("/posts")
        .then(response => response.json())
        .then(posts => {
            const postList = document.getElementById("postList");
            postList.innerHTML = "";
            posts.forEach(post => {
                const postItem = document.createElement("div");
                postItem.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
                postList.appendChild(postItem);
            });
        });
    }

    loadPosts();
});