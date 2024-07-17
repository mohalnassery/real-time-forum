import { fetchPost, enableInteractions, disableInteractions, likePost, dislikePost, submitComment, deletePost, deleteComment, likeComment, dislikeComment } from '../components/postdetails/interactions.js';

export async function initPostDetails(app, postId) {
  console.log("initPostDetails");
  app.innerHTML = `
  <div class="main-section">
    <div class="post-container">
      <div class="top">
        <a href="/" class="back-button">
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
        <h2 id="post-title">Title Of Post</h2>
        <img id="post-image" src="" alt="Post Image" style="max-width: 100%; height: auto; margin-bottom: 20px; display: none;">
        <p id="post-body"></p>
      </div>

      <div class="tags" id="post-tags">
        <!-- Categories will be dynamically added here -->
      </div>

      <div id="post-actions">
        <div class="stats">
          <div class="like-dislike">
            <div>
              <p id="post-likes">30</p>
              <i class="fa-solid fa-thumbs-up" id="like-btn"></i>
            </div>

            <div>
              <p id="post-dislikes">5</p>
              <i class="fa-solid fa-thumbs-down" id="dislike-btn"></i>
            </div>
          </div>

          <div class="comment-count">
            <p id="post-comments">10</p>
            <i class="fa-solid fa-comment"></i>
          </div>
        </div>
      </div>
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
  `;

  try {
    await fetchPost(postId);
    enableInteractions();
    addEventListeners(postId);
  } catch (error) {
    disableInteractions();
  }
}

function addEventListeners(postId) {
  document.getElementById("like-btn").addEventListener("click", () => likePost(postId));
  document.getElementById("dislike-btn").addEventListener("click", () => dislikePost(postId));
  document.getElementById("submit-comment").addEventListener("click", submitComment);

  document.getElementById("comment-section").addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-trash")) {
      const commentId = e.target.dataset.commentId;
      deleteComment(commentId);
    } else if (e.target.classList.contains("fa-thumbs-up")) {
      const commentId = e.target.dataset.commentId;
      likeComment(commentId);
    } else if (e.target.classList.contains("fa-thumbs-down")) {
      const commentId = e.target.dataset.commentId;
      dislikeComment(commentId);
    }
  });

  const deletePostButton = document.querySelector("#post-actions .fa-trash");
  if (deletePostButton) {
    deletePostButton.addEventListener("click", deletePost);
  }
}