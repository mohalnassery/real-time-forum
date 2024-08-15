import { fetchPostDetailsFromServer, displayPostDetails, displayComments, fetchPostDetails } from './PostDetails.js';

const maxCharacters = 500;

export async function fetchPost(postId) {
  try {
    const postDetails = await fetchPostDetailsFromServer(postId);
    displayPostDetails(postDetails.post);
    displayComments(postDetails.comments);
  } catch (error) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
      errorElement.textContent = 'Failed to load post details.';
    }
  }
}

export function enableInteractions() {
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

  // Ensure event listeners are not added multiple times
  if (!submitCommentBtn.hasAttribute("data-listener")) {
    submitCommentBtn.addEventListener("click", submitComment);
    submitCommentBtn.setAttribute("data-listener", "true");
  }
  if (!likeButton.hasAttribute("data-listener")) {
    likeButton.addEventListener("click", likePost);
    likeButton.setAttribute("data-listener", "true");
  }
  if (!dislikeButton.hasAttribute("data-listener")) {
    dislikeButton.addEventListener("click", dislikePost);
    dislikeButton.setAttribute("data-listener", "true");
  }

  const charCount = document.getElementById("char-count");

  commentInput.addEventListener("input", function () {
    const remainingChars = maxCharacters - commentInput.textContent.replaceAll("<div><br></div>", "\n").replaceAll("<div>", "\n").replaceAll("</div>", "").replaceAll("<br>", "\n").replaceAll("&nbsp;", " ").length;
    charCount.textContent = remainingChars + "/" + maxCharacters;
    submitCommentBtn.disabled = remainingChars < 0;
  });

  enablePostEdit();
  enableCommentEdit();
}

export function disableInteractions() {
  const commentInput = document.getElementById("comment-input");
  commentInput.setAttribute("contenteditable", "false");
  commentInput.setAttribute("placeholder", "Please login to be able to comment...");
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

async function handleRequestWithButtonState(button, requestFunction) {
  button.disabled = true;
  try {
    await requestFunction();
  } finally {
    button.disabled = false;
  }
}

export async function likePost() {
  const postId = getPostIdFromURL();
  const likeButton = document.getElementById("like-btn");
  await handleRequestWithButtonState(likeButton, async () => {
    try {
      const response = await fetch(`/posts/${postId}/like`, { method: "POST" });
      if (response.ok) {
        await fetchPostDetails(postId); // Re-fetch post details
      } else {
        const errorMessage = await response.text();
        console.error("Error liking post:", errorMessage);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  });
}

export async function dislikePost() {
  const postId = getPostIdFromURL();
  const dislikeButton = document.getElementById("dislike-btn");
  await handleRequestWithButtonState(dislikeButton, async () => {
    try {
      const response = await fetch(`/posts/${postId}/dislike`, { method: "POST" });
      if (response.ok) {
        await fetchPostDetails(postId); // Re-fetch post details
      } else {
        const errorMessage = await response.text();
        console.error("Error disliking post:", errorMessage);
      }
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  });
}

export async function deletePost() {
  const postId = getPostIdFromURL();
  const confirmation = confirm("Are you sure you want to delete this post?");
  if (!confirmation) return;

  try {
    const response = await fetch(`/posts/${postId}`, { method: "DELETE" });
    if (response.ok) {
      window.location.href = "/";
    } else {
      const errorMessage = await response.text();
      console.error("Error deleting post:", errorMessage);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }
}

export function enablePostEdit() {
  const editPostBtn = document.getElementById("edit-post-btn");
  const deletePostBtn = document.getElementById("delete-post-btn");
  
  if (editPostBtn) {
    editPostBtn.style.display = "inline-block";
    editPostBtn.addEventListener("click", editPost);
  }
  
  if (deletePostBtn) {
    deletePostBtn.style.display = "inline-block";
    deletePostBtn.addEventListener("click", deletePost);
  }
}

export function editPost() {
  const postTitle = document.getElementById('post-title');
  const postBody = document.getElementById('post-body');
  const postActions = document.getElementById('post-actions');
  const editButton = postActions.querySelector('.fa-edit, .fa-times');
  const existingSaveButton = postActions.querySelector('.save-changes-btn');

  if (existingSaveButton) {
    postTitle.contentEditable = false;
    postBody.contentEditable = false;
    existingSaveButton.remove();
    editButton.className = 'fa-solid fa-edit';
  } else {
    postTitle.contentEditable = true;
    postBody.contentEditable = true;
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.className = 'save-changes-btn';
    saveButton.addEventListener('click', savePostChanges);
    
    postActions.appendChild(saveButton);
    editButton.className = 'fa-solid fa-times';
  }
}

export function savePostChanges() {
  const postId = getPostIdFromURL();
  const postTitle = document.getElementById('post-title').textContent;
  const postBody = document.getElementById('post-body').textContent;
  
  fetch(`/posts/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: postTitle, body: postBody }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    document.getElementById('post-title').contentEditable = false;
    document.getElementById('post-body').contentEditable = false;
    document.querySelector('#post-actions .save-changes-btn').remove();
    document.querySelector('#post-actions .fa-times').className = 'fa-solid fa-edit';
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

export async function likeComment(commentId) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    console.log("User is not logged in. Cannot like comment.");
    return;
  }

  try {
    const response = await fetch(`/comments/${commentId}/like`, { method: "POST" });
    if (response.ok) {
      await fetchPostDetails(getPostIdFromURL()); // Re-fetch post details
    } else {
      const errorMessage = await response.text();
      console.error("Error liking comment:", errorMessage);
    }
  } catch (error) {
    console.error("Error liking comment:", error);
  }
}

export async function dislikeComment(commentId) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    console.log("User is not logged in. Cannot dislike comment.");
    return;
  }

  try {
    const response = await fetch(`/comments/${commentId}/dislike`, { method: "POST" });
    if (response.ok) {
      await fetchPostDetails(getPostIdFromURL()); // Re-fetch post details
    } else {
      const errorMessage = await response.text();
      console.error("Error disliking comment:", errorMessage);
    }
  } catch (error) {
    console.error("Error disliking comment:", error);
  }
}

export async function deleteComment(commentId) {
  const confirmation = confirm("Are you sure you want to delete this comment?");
  if (!confirmation) return;

  try {
    const response = await fetch(`/comments/${commentId}`, { method: "DELETE" });
    if (response.ok) {
      await fetchPostDetails(getPostIdFromURL()); // Re-fetch post details
    } else {
      const errorMessage = await response.text();
      console.error("Error deleting comment:", errorMessage);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

export function enableCommentEdit() {
  document.getElementById("comment-section").addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-comment-btn")) {
      const commentId = e.target.dataset.commentId;
      editComment(commentId);
    }
  });
}

export function editComment(commentId, commentElement) {
  const commentActions = commentElement.parentElement.querySelector('.comment-actions');
  const editButton = commentActions.querySelector('.fa-edit, .fa-times');
  const existingSaveButton = commentActions.querySelector('.save-comment-btn');

  if (existingSaveButton) {
    commentElement.contentEditable = false;
    existingSaveButton.remove();
    editButton.className = 'fa-solid fa-edit';
  } else {
    commentElement.contentEditable = true;
    commentElement.focus();
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-comment-btn';
    saveButton.addEventListener('click', () => saveCommentChanges(commentId, commentElement));
    
    editButton.parentNode.insertBefore(saveButton, editButton);
    editButton.className = 'fa-solid fa-times';
  }
}

export async function saveCommentChanges(commentId, commentElement) {
  const newBody = commentElement.textContent.trim();
  
  try {
    const response = await fetch(`/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newBody }),
    });
    
    if (response.ok) {
      commentElement.contentEditable = false;
      const saveButton = commentElement.parentElement.querySelector('.save-comment-btn');
      if (saveButton) saveButton.remove();
      const editButton = commentElement.parentElement.querySelector('.fa-times');
      if (editButton) editButton.className = 'fa-solid fa-edit';
    } else {
      console.error("Failed to update comment");
    }
  } catch (error) {
    console.error("Error updating comment:", error);
  }
}

export async function submitComment() {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody }),
    });

    if (response.ok) {
      commentInput.textContent = "";
      await fetchPostDetails(postId); // Re-fetch post details
    } else {
      const errorMessage = await response.text();
      document.getElementById("error").textContent = `Error submitting comment: ${errorMessage}`;
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
    document.getElementById("error").textContent = "Error submitting comment.";
  }
}

export function getPostIdFromURL() {
  const hash = window.location.hash;
  const postId = hash.split("/")[1];
  return postId;
}