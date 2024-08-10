export async function fetchUserActivity(userID) {
    try {
        const response = await fetch(`/user-profile?user_id=${userID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch user activity");
        }
        const data = await response.json();
        const activity = data.activity;
        //console.log(activity); // Log the response to check the structure

        // Normalize the creationDate field and ensure properties are initialized
        activity.createdPosts = (activity.createdPosts || []).map(post => ({
            ...post,
            creationDate: new Date(post.creationdate)
        }));
        activity.likedPosts = (activity.likedPosts || []).map(post => ({
            ...post,
            creationDate: new Date(post.creationdate)
        }));
        activity.dislikedPosts = (activity.dislikedPosts || []).map(post => ({
            ...post,
            creationDate: new Date(post.creationdate)
        }));
        activity.comments = (activity.comments || []).map(comment => ({
            ...comment,
            creationDate: new Date(comment.creationDate)
        }));
        activity.likedComments = (activity.likedComments || []).map(comment => ({
            ...comment,
            creationDate: new Date(comment.creationDate)
        }));
        activity.dislikedComments = (activity.dislikedComments || []).map(comment => ({
            ...comment,
            creationDate: new Date(comment.creationDate)
        }));

        displayUserActivity(activity);
    } catch (error) {
        console.error(error);
    }
}

export function displayUserActivity(activity) {
    const createdPostsSection = document.getElementById("created-posts-section");
    const createdCommentsSection = document.getElementById("created-comments-section");
    const likedPostsSection = document.getElementById("liked-posts-section");
    const dislikedPostsSection = document.getElementById("disliked-posts-section");
    const likedCommentsSection = document.getElementById("liked-comments-section");
    const dislikedCommentsSection = document.getElementById("disliked-comments-section");

    // Clear any existing content
    createdPostsSection.innerHTML = '';
    createdCommentsSection.innerHTML = '';
    likedPostsSection.innerHTML = '';
    dislikedPostsSection.innerHTML = '';
    likedCommentsSection.innerHTML = '';
    dislikedCommentsSection.innerHTML = '';

    // Ensure activity properties are initialized
    const createdPosts = activity.createdPosts || [];
    const likedPosts = activity.likedPosts || [];
    const dislikedPosts = activity.dislikedPosts || [];
    const comments = activity.comments || [];
    const likedComments = activity.likedComments || [];
    const dislikedComments = activity.dislikedComments || [];

    // Display created posts
    if (createdPosts.length > 0) {
        createdPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.className = "activity-item";
            postElement.innerHTML = `
                <h3><a href="/#post/${post.postID}">${post.title}</a></h3>
                <p>${post.body}</p>
                <small>Created on: ${post.creationDate instanceof Date && !isNaN(post.creationDate) ? post.creationDate.toLocaleString() : 'Invalid Date'}</small>`;
            createdPostsSection.appendChild(postElement);
        });
    }

    // Display liked posts
    if (likedPosts.length > 0) {
        likedPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.className = "activity-item";
            postElement.innerHTML = `
                <h3><a href="/#post/${post.postID}">${post.title}</a></h3>
                <p>${post.body}</p>
                <small>Created on: ${post.creationDate instanceof Date && !isNaN(post.creationDate) ? post.creationDate.toLocaleString() : 'Invalid Date'}</small>`;
            likedPostsSection.appendChild(postElement);
        });
    }

    // Display disliked posts
    if (dislikedPosts.length > 0) {
        dislikedPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.className = "activity-item";
            postElement.innerHTML = `
                <h3><a href="/#post/${post.postID}">${post.title}</a></h3>
                <p>${post.body}</p>
                <small>Created on: ${post.creationDate instanceof Date && !isNaN(post.creationDate) ? post.creationDate.toLocaleString() : 'Invalid Date'}</small>`;
            dislikedPostsSection.appendChild(postElement);
        });
    }

    // Display comments
    if (comments.length > 0) {
        comments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.className = "activity-item";
            const postTitle = comment.post ? comment.post.title : "Unknown Post"; // Handle missing post field
            commentElement.innerHTML = `
                <h3>Comment on: <a href="/#post/${comment.postID}">${postTitle}</a></h3>
                <p>${comment.body}</p>
                <small>Created on: ${comment.creationDate instanceof Date && !isNaN(comment.creationDate) ? comment.creationDate.toLocaleString() : 'Invalid Date'}</small>`;
            createdCommentsSection.appendChild(commentElement);
        });
    }

    // Display liked comments
    if (likedComments.length > 0) {
        likedComments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.className = "activity-item";
            const postTitle = comment.post ? comment.post.title : "Unknown Post"; // Handle missing post field
            commentElement.innerHTML = `
                <h3>Liked Comment on: <a href="/#post/${comment.postID}">${postTitle}</a></h3>
                <p>${comment.body}</p>
                <small>Created on: ${comment.creationDate instanceof Date && !isNaN(comment.creationDate) ? comment.creationDate.toLocaleString() : 'Invalid Date'}</small>`;
            likedCommentsSection.appendChild(commentElement);
        });
    }

    // Display disliked comments
    if (dislikedComments.length > 0) {
        dislikedComments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.className = "activity-item";
            const postTitle = comment.post ? comment.post.title : "Unknown Post"; // Handle missing post field
            commentElement.innerHTML = `
                <h3>Disliked Comment on: <a href="/#post/${comment.postID}">${postTitle}</a></h3>
                <p>${comment.body}</p>
                <small>Created on: ${comment.creationDate instanceof Date && !isNaN(comment.creationDate) ? comment.creationDate.toLocaleString() : 'Invalid Date'}</small>`;
            dislikedCommentsSection.appendChild(commentElement);
        });
    }
}