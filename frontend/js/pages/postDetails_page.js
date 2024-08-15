import { fetchPost, enableInteractions, disableInteractions, likePost, dislikePost, submitComment, deletePost, deleteComment, likeComment, dislikeComment } from '../components/postdetails/interactions.js';
import { loadCSS } from '../components/utils.js';

export async function initPostDetails(app, postId) {
  app.innerHTML = `
  <div class="main-section hidden"> <!-- Add hidden class initially -->
    <div class="post-container">
      <div class="top">
        <a id="back-button" class="back-button">
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
        <h2 id="post-title"></h2>
        <img id="post-image" src="" alt="Post Image" style="max-width: 100%; height: auto; margin-bottom: 20px; display: none;">
        <div id="post-body"></div>
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

  loadCSS('./css/pages/post-details.css');
  try {
    await fetchPost(postId);
    enableInteractions();
    addEventListeners(postId);

    // Trigger the animation after appending the elements
    setTimeout(() => {
      document.querySelectorAll('.hidden').forEach(element => {
        if (!element.classList.contains('animate-on-load')) {
          element.classList.remove('hidden');
          element.classList.add('animate-on-load');
        }
      });
    }, 100);
  } catch (error) {
    disableInteractions();
  }
}

function addEventListeners(postId) {
  document.getElementById("back-button").addEventListener("click", () => {
    window.location.hash = "";
  })
  const likeButton = document.getElementById("like-btn");
  const dislikeButton = document.getElementById("dislike-btn");
  const submitCommentBtn = document.getElementById("submit-comment");

  // Ensure event listeners are not added multiple times
  if (!likeButton.hasAttribute("data-listener")) {
    likeButton.addEventListener("click", () => likePost(postId));
    likeButton.setAttribute("data-listener", "true");
  }
  if (!dislikeButton.hasAttribute("data-listener")) {
    dislikeButton.addEventListener("click", () => dislikePost(postId));
    dislikeButton.setAttribute("data-listener", "true");
  }
  if (!submitCommentBtn.hasAttribute("data-listener")) {
    submitCommentBtn.addEventListener("click", submitComment);
    submitCommentBtn.setAttribute("data-listener", "true");
  }

  const deletePostButton = document.querySelector("#post-actions .fa-trash");
  if (deletePostButton) {
    deletePostButton.addEventListener("click", deletePost);
  }
}