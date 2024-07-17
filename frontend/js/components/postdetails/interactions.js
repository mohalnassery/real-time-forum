import { submitComment, fetchPostDetailsFromServer, displayPostDetails, displayComments } from './PostDetails.js';

export async function fetchPost(postId) {
  try {
    console.log("fetchPosts");
    const postDetails = await fetchPostDetailsFromServer(postId);
    console.log(postDetails)
    displayPostDetails(postDetails.post)
    displayComments(postDetails.comments)
    // Process postDetails
  } catch (error) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
      errorElement.textContent = 'Failed to load post details.';
    }
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

export async function likePost(postId) {
  console.log("likePost");
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

export async function dislikePost(postId) {
  console.log("dislikePost");
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
