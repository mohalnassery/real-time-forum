import { getPostIdFromURL, submitComment, fetchPostDetailsFromServer } from './PostDetails.js';

export async function fetchPostsAndStatus() {
  try {
    console.log("fetchPostsAndStatus");
    const postId = getPostIdFromURL(); // Ensure this function correctly extracts the postId from the URL
    const postDetails = await fetchPostDetailsFromServer(postId);
    // Process postDetails
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      enableInteractions();
    } else {
      disableInteractions();
    }
  } catch (error) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
      errorElement.textContent = 'Failed to load post details.';
    }
    disableInteractions();
  }
}

export function enableInteractions() {
  console.log("enableInteractions");
  const submitCommentBtn = document.getElementById("submit-comment");
  const likeButton = document.getElementById("like-btn");
  const dislikeButton = document.getElementById("dislike-btn");
  const commentInput = document.getElementById("comment-input");
  submitCommentBtn.removeAttribute("disabled");
  likeButton.disabled = false;
  dislikeButton.disabled = false;
  likeButton.classList.remove("disabled-button");
  dislikeButton.classList.remove("disabled-button");
  commentInput.removeAttribute("disabled");

  // Event Listeners
  submitCommentBtn.addEventListener("click", submitComment);
  likeButton.addEventListener("click", likePost);
  dislikeButton.addEventListener("click", dislikePost);
  const charCount = document.getElementById("char-count");

  commentInput.addEventListener("input", function () {
    const remainingChars =
      maxCharacters -
      commentInput.textContent
        .replaceAll("<div><br></div>", "\n")
        .replaceAll("<div>", "\n")
        .replaceAll("</div>", "")
        .replaceAll("<br>", "\n")
        .replaceAll("&nbsp;", " ").length;

    charCount.textContent = remainingChars + "/" + maxCharacters;
    submitCommentBtn.disabled = remainingChars < 0;
  });

  enablePostEdit();
  enableCommentEdit();
}

export function disableInteractions() {
  console.log("disableInteractions");
  const commentInput = document.getElementById("comment-input");
  commentInput.setAttribute("contenteditable", "false");
  commentInput.setAttribute(
    "placeholder",
    "Please login to be able to comment..."
  );
  document.getElementById("submit-comment").setAttribute("disabled", "");
  const likeButton = document.getElementById("like-btn");
  const dislikeButton = document.getElementById("dislike-btn");
  likeButton.disabled = true;
  dislikeButton.disabled = true;
  likeButton.classList.add("disabled-button");
  dislikeButton.classList.add("disabled-button");
  likeButton.classList.remove("liked");
  dislikeButton.classList.remove("disliked");
}

export async function likePost() {
  console.log("likePost");
  const postId = getPostIdFromURL();
  try {
    const response = await fetch(`/posts/${postId}/like`, {
      method: "POST",
    });

    if (response.ok) {
      fetchPostDetailsFromServer(postId); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      console.error("Error liking post:", errorMessage);
    }
  } catch (error) {
    console.error("Error liking post:", error);
  }
}

export async function dislikePost() {
  console.log("dislikePost");
  const postId = getPostIdFromURL();
  try {
    const response = await fetch(`/posts/${postId}/dislike`, {
      method: "POST",
    });

    if (response.ok) {
      fetchPostDetailsFromServer(postId); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      console.error("Error disliking post:", errorMessage);
    }
  } catch (error) {
    console.error("Error disliking post:", error);
  }
}
