import { fetchPosts } from '../components/postdetails/interactions.js';
import { getPostIdFromURL } from '../components/postdetails/PostDetails.js';

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

  await fetchPostsAndStatus();
}