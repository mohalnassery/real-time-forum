import { displayPostDetails, displayComments, getPostIdFromURL } from './PostDetails.js';
import { fetchPostDetails } from './fetchPostDetails.js';
import { submitComment } from './interactions.js';

export async function fetchPostDetails(postId) {
  try {
    console.log("fetchPostDetails");
    const response = await fetch(`/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch post details. Status: ${response.status}. Message: ${errorMessage}`);
    }

    const postDetails = await response.json();
    displayPostDetails(postDetails.post);
    displayComments(postDetails.comments);
    return postDetails;
  } catch (error) {
    console.error('Error fetching post details:', error);
    throw error;
  }
}

export function displayPostDetails(post) {
  console.log("displayPostDetails");
  document.getElementById("post-author-avatar").textContent = post.author
    .charAt(0)
    .toUpperCase();
  document.getElementById("post-author").innerHTML =
    post.author +
    ` <span>• ${new Date(post.creationdate).toLocaleDateString()}</span>`;
  document.getElementById("post-comments").textContent = post.commentCount;
  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-body").innerHTML = post.body;
  document.getElementById("post-likes").textContent = post.likes;
  document.getElementById("post-dislikes").textContent = post.dislikes;
  const likeButton = document.getElementById("like-btn");
  const dislikeButton = document.getElementById("dislike-btn");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    likeButton.classList.toggle("liked", post.userLiked);
    dislikeButton.classList.toggle("disliked", post.userDisliked);
  } else {
    likeButton.classList.remove("liked");
    dislikeButton.classList.remove("disliked");
  }
  const tagsContainer = document.getElementById("post-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = ""; // Clear existing tags

    post.categories.forEach((category) => {
      const tag = document.createElement("div");
      tag.textContent = category;
      tagsContainer.appendChild(tag);
    });
  }
  // Display the associated image
  const postImage = document.getElementById("post-image");
  if (post.image) {
    // Construct the correct image URL
    const imageUrl = `/uploads/${post.image}`;
    postImage.src = imageUrl;
    postImage.style.display = "block";
  } else {
    postImage.style.display = "none";
  }

  if (post.isAuthor) {
    const postActions = document.getElementById("post-actions");
    if (postActions) {
      // Check if the delete post button already exists
      const existingDeleteButton = postActions.querySelector("i.fa-trash");
      if (!existingDeleteButton) {
        // Create and append the delete post button
        const deletePostButton = document.createElement("i");
        deletePostButton.className = "fa-solid fa-trash";
        deletePostButton.addEventListener("click", deletePost);
        postActions.appendChild(deletePostButton);
      }

      // Check if the edit post button already exists
      const existingEditButton = postActions.querySelector("i.fa-edit, i.fa-times");
      if (!existingEditButton) {
        // Create and append the edit post button
        const editPostButton = document.createElement("i");
        editPostButton.className = "fa-solid fa-edit";
        editPostButton.addEventListener("click", editPost);
        postActions.appendChild(editPostButton);
      }
    } else {
      console.log("Post actions container not found");
    }
  }
}

export function displayComments(comments) {
  console.log("displayComments");
  const commentList = document.getElementById("comment-section");
  commentList.innerHTML = "";

  if (comments && comments.length > 0) {
    comments.forEach((comment) => {
      const commentCard = document.createElement("div");
      commentCard.classList.add("comment");

      // Add comment details to the card
      commentCard.innerHTML = `
        <div class="comment-author-avatar">${comment.author.charAt(0).toUpperCase()}</div>
        <div class="comment-content">
          <p class="comment-author">${comment.author} <span>• ${new Date(comment.creationdate).toLocaleDateString()}</span></p>
          <p class="comment-body">${comment.body}</p>
          <div class="comment-actions">
            <i class="fa-solid fa-thumbs-up" onclick="likeComment(${comment.id})"></i>
            <i class="fa-solid fa-thumbs-down" onclick="dislikeComment(${comment.id})"></i>
            ${comment.isAuthor ? `<i class="fa-solid fa-trash" onclick="deleteComment(${comment.id})"></i>` : ""}
          </div>
        </div>
      `;

      commentList.appendChild(commentCard);
    });
  } else {
    commentList.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
  }
}

export function getPostIdFromURL() {
  console.log("getPostIdFromURL");
  const urlParts = window.location.pathname.split("/");
  return urlParts[urlParts.length - 1];
}

export async function submitComment() {
  console.log("submitComment");
  const postId = getPostIdFromURL();
  const commentInput = document.getElementById("comment-input");
  const commentBody = commentInput.textContent.trim();

  if (!commentBody) {
    document.getElementById("error").textContent = "Comment cannot be empty.";
    return;
  }

  try {
    const response = await fetch(`/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: commentBody }),
    });

    if (response.ok) {
      commentInput.textContent = "";
      fetchPostDetails(postId); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      document.getElementById("error").textContent = `Error submitting comment: ${errorMessage}`;
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
    document.getElementById("error").textContent = "Error submitting comment.";
  }
}
