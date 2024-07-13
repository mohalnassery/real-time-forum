export async function initPostDetails(app, postId) {
  console.log("initPostDetails");
  app.innerHTML = `
    <div class="main-section">
      <div class="post-container">
        <div class="top">
          <a href="#" class="back-button">
            <div class="back-button">
              <i class="fa-solid fa-arrow-left"></i>
            </div>
          </a>
          <div class="info">
            <div class="avatar" id="post-author-avatar">J</div>
            <p id="post-author">John <span>• 21-10-2003</span></p>
          </div>
        </div>
        <div class="content-section">
          <!-- Post content will be dynamically added here -->
        </div>
        <div class="input-area">
          <div class="input-immitate" id="comment-input" contenteditable="true" placeholder="Add a Comment..." maxlength="500"></div>
          <div class="error-container" id="error"></div>
          <div class="submit-comment-div">
            <button id="submit-comment" class="submit-button">Submit</button>
            <span id="char-count">500/500</span>
          </div>
          <p>
            <strong>Please Note:</strong>Your comments will be public and visible
            to everyone. We encourage a respectful and constructive dialogue.
            Ensure your contributions are relevant to the topic and add value to
            the discussion. Thank you for sharing your insights!
          </p>
        </div>
        <div class="comment-section" id="comment-section">
          <!-- Comments will be dynamically added here -->
        </div>
      </div>
    </div>
  `;

  await fetchPostDetails(postId);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  fetchPostsAndStatus();
});

// Event listener for login status update
window.addEventListener("loginStatusUpdate", (event) => {
  console.log("loginStatusUpdate");
  const { isLoggedIn } = event.detail;
  if (isLoggedIn) {
    enableInteractions();
  } else {
    disableInteractions();
  }
});

async function fetchPostsAndStatus() {
  try {
    console.log("fetchPostsAndStatus");
    const postId = getPostIdFromURL(); // Ensure this function correctly extracts the postId from the URL
    const postDetails = await fetchPostDetails(postId);
    // Process postDetails
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      enableInteractions();
    } else {
      disableInteractions();
    }
  } catch (error) {
    document.getElementById('error').textContent = 'Failed to load post details.';
    disableInteractions();
  }
}

async function fetchPostDetails(postId) {
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

function enableInteractions() {
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

function disableInteractions() {
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

function getPostIdFromURL() {
  console.log("getPostIdFromURL");
  const urlParts = window.location.pathname.split("/");
  return urlParts[urlParts.length - 1];
}

function displayPostDetails(post) {
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

function displayComments(comments) {
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

async function submitComment() {
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

async function likePost() {
  console.log("likePost");
  const postId = getPostIdFromURL();
  try {
    const response = await fetch(`/posts/${postId}/like`, {
      method: "POST",
    });

    if (response.ok) {
      fetchPostDetails(postId); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      console.error("Error liking post:", errorMessage);
    }
  } catch (error) {
    console.error("Error liking post:", error);
  }
}

async function dislikePost() {
  console.log("dislikePost");
  const postId = getPostIdFromURL();
  try {
    const response = await fetch(`/posts/${postId}/dislike`, {
      method: "POST",
    });

    if (response.ok) {
      fetchPostDetails(postId); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      console.error("Error disliking post:", errorMessage);
    }
  } catch (error) {
    console.error("Error disliking post:", error);
  }
}

async function likeComment(commentId) {
  console.log("likeComment");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    console.log("User is not logged in. Cannot like comment.");
    return;
  }

  try {
    const response = await fetch(`/comments/${commentId}/like`, {
      method: "POST",
    });

    if (response.ok) {
      fetchPostDetails(getPostIdFromURL()); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      console.error("Error liking comment:", errorMessage);
    }
  } catch (error) {
    console.error("Error liking comment:", error);
  }
}

async function dislikeComment(commentId) {
  console.log("dislikeComment");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    console.log("User is not logged in. Cannot dislike comment.");
    return;
  }

  try {
    const response = await fetch(`/comments/${commentId}/dislike`, {
      method: "POST",
    });

    if (response.ok) {
      fetchPostDetails(getPostIdFromURL()); // Refresh the post details
    } else {
      const errorMessage = await response.text();
      console.error("Error disliking comment:", errorMessage);
    }
  } catch (error) {
    console.error("Error disliking comment:", error);
  }
}

async function deletePost() {
  console.log("deletePost");
  const postId = getPostIdFromURL();
  try {
    const response = await fetch(`/posts/${postId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      window.location.href = "/"; // Redirect to the home page after successful deletion
    } else {
      const errorMessage = await response.text();
      console.error("Error deleting post:", errorMessage);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }
}

async function deleteComment(commentId) {
  console.log("deleteComment");
  try {
    const response = await fetch(`/comments/${commentId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchPostDetails(getPostIdFromURL()); // Refresh the post details after successful deletion
    } else {
      const errorMessage = await response.text();
      console.error("Error deleting comment:", errorMessage);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

function enablePostEdit() {
  console.log("enablePostEdit");
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

function enableCommentEdit() {
  console.log("enableCommentEdit");
  document.getElementById("comment-section").addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-comment-btn")) {
      const commentId = e.target.dataset.commentId;
      editComment(commentId);
    }
  });
}

function editPost() {
  console.log("editPost");
  const postTitle = document.getElementById('post-title');
  const postBody = document.getElementById('post-body');
  const postActions = document.getElementById('post-actions');
  const editButton = postActions.querySelector('.fa-edit, .fa-times');
  const existingSaveButton = postActions.querySelector('.save-changes-btn');

  if (existingSaveButton) {
    // If save button exists, we're in edit mode. Cancel edit.
    postTitle.contentEditable = false;
    postBody.contentEditable = false;
    existingSaveButton.remove();
    editButton.className = 'fa-solid fa-edit';
  } else {
    // Enter edit mode
    postTitle.contentEditable = true;
    postBody.contentEditable = true;
    
    // Create save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.className = 'save-changes-btn';
    saveButton.addEventListener('click', savePostChanges);
    
    // Append save button to post actions
    postActions.appendChild(saveButton);

    // Change edit icon to cancel icon
    editButton.className = 'fa-solid fa-times';
  }
}

function savePostChanges() {
  console.log("savePostChanges");
  const postId = getPostIdFromURL();
  const postTitle = document.getElementById('post-title').textContent;
  const postBody = document.getElementById('post-body').textContent;
  
  fetch(`/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: postTitle,
      body: postBody,
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    // Disable editing and remove save button
    document.getElementById('post-title').contentEditable = false;
    document.getElementById('post-body').contentEditable = false;
    document.querySelector('#post-actions .save-changes-btn').remove();
    document.querySelector('#post-actions .fa-times').className = 'fa-solid fa-edit';
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle error (e.g., show error message to user)
  });
}