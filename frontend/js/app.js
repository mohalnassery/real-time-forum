document.addEventListener("DOMContentLoaded", function() {
     const createPostForm = document.getElementById("createPostForm");
    const sendMessageForm = document.getElementById("sendMessageForm");


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