import { enableInteractions, likeComment, likePost, dislikeComment, dislikePost, deletePost, editPost, deleteComment, editComment } from "./interactions.js";

export async function fetchPostDetailsFromServer(postId) {
  try {
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
    return postDetails;
  } catch (error) {
    console.error('Error fetching post details:', error);
    throw error;
  }
}

export function displayPostDetails(post) {
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

  // Trigger the animation after setting the content
  setTimeout(() => {
    document.querySelectorAll('.hidden').forEach(element => {
      element.classList.remove('hidden');
      element.classList.add('animate-on-load');
    });
  }, 100);

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
  const commentList = document.getElementById("comment-section");
  commentList.innerHTML = ""; // Clear existing comments

  if (comments && comments.length > 0) {
    comments.forEach((comment) => {
      const commentCard = document.createElement("div");
      commentCard.classList.add("comment", "hidden"); // Add hidden class initially

      const commentHeader = document.createElement("div");
      commentHeader.classList.add("info");

      const avatar = document.createElement("div");
      avatar.classList.add("avatar");
      avatar.textContent = comment.author.charAt(0).toUpperCase();
      commentHeader.appendChild(avatar);

      const author = document.createElement("p");
      author.innerHTML =
        comment.author +
        ` <span>• ${new Date(comment.creationDate).toLocaleDateString()}</span>`;
      commentHeader.appendChild(author);

      commentCard.appendChild(commentHeader);
      const commentText = document.createElement("p");
      commentText.classList.add("comment-data");
      commentText.innerHTML = comment.body;
      commentCard.appendChild(commentText);
      const commentActions = document.createElement("div");
      commentActions.classList.add("like-dislike");

      const likes = document.createElement("div");
      const likeCount = document.createElement("p");
      likeCount.classList.add("comment-likes");
      likeCount.innerText = comment.likes;
      likes.appendChild(likeCount);

      const likeButton = document.createElement("i");
      likeButton.id = `like-comment-${comment.id}`;
      likeButton.className = "fa-solid fa-thumbs-up";
      likeButton.addEventListener("click", () => likeComment(comment.id));
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn) {
        likeButton.disabled = false;
        likeButton.classList.remove("disabled-button");
      } else {
        likeButton.disabled = true;
        likeButton.classList.add("disabled-button");
      }
      likeButton.classList.toggle("liked", comment.userLiked);
      likes.appendChild(likeButton);

      commentActions.appendChild(likes);

      const dislikes = document.createElement("div");
      const dislikeCount = document.createElement("p");
      dislikeCount.classList.add("comment-dislikes");
      dislikeCount.innerText = comment.dislikes;
      dislikes.appendChild(dislikeCount);

      const dislikeButton = document.createElement("i");
      dislikeButton.id = `dislike-comment-${comment.id}`;
      dislikeButton.className = "fa-solid fa-thumbs-down";
      dislikeButton.addEventListener("click", () => dislikeComment(comment.id));
      if (isLoggedIn) {
        dislikeButton.disabled = false;
        dislikeButton.classList.remove("disabled-button");
      } else {
        dislikeButton.disabled = true;
        dislikeButton.classList.add("disabled-button");
      }
      dislikeButton.classList.toggle("disliked", comment.userDisliked);
      dislikes.appendChild(dislikeButton);

      commentActions.appendChild(dislikes);

      commentCard.appendChild(commentActions);

      if (comment.isAuthor) {
        const commentActions = document.createElement("div");
        commentActions.classList.add("comment-actions");

        const deleteCommentButton = document.createElement("i");
        deleteCommentButton.className = "fa-solid fa-trash";
        deleteCommentButton.addEventListener("click", () =>
          deleteComment(comment.id)
        );
        commentActions.appendChild(deleteCommentButton);

        const editCommentButton = document.createElement("i");
        editCommentButton.className = "fa-solid fa-edit";
        editCommentButton.addEventListener("click", () =>
          editComment(comment.id, commentText)
        );
        commentActions.appendChild(editCommentButton);

        commentCard.appendChild(commentActions);
      }

      commentList.appendChild(commentCard);

      // Trigger the animation after appending the element
      setTimeout(() => {
        commentCard.classList.remove("hidden");
        commentCard.classList.add("animate-on-load");
      }, 100);
    });
  } else {
    const noCommentsMessage = document.createElement("p");
    noCommentsMessage.textContent = "No comments available.";
    commentList.appendChild(noCommentsMessage);
  }

  // Clear the comment input field
  document.getElementById("comment-input").value = "";
}

export async function fetchPostDetails(postId) {
  try {
    const postDetails = await fetchPostDetailsFromServer(postId);
    displayPostDetails(postDetails.post);
    displayComments(postDetails.comments);
    return postDetails;
  } catch (error) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
      errorElement.textContent = 'Failed to load post details.';
    }
    disableInteractions();
    throw error;
  }
}