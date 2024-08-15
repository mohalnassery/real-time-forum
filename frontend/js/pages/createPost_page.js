import { checkLoginStatus } from '../components/auth/auth_handling.js';
import { createCategoryCheckboxes, validateImageUpload, createPost, fetchCategories, validateTitleLength, validateMessageLength } from '../components/createpost/createpost.js';
import { loadCSS } from '../components/utils.js';

export function initCreatePost(mainContent) {
  mainContent.innerHTML = `
    <section id="new-post">
      <h2>Create a Topic</h2>
      <form id="create-post-form" method="POST" enctype="multipart/form-data">
        <div>
          <label for="title" class="input-label">Title:</label>
          <p class="details">Be specific and summarize your topic (max 100 characters)</p>
          <input type="text" id="title" name="title" required maxlength="100" /><br />
          <span id="title-counter">100/100</span>
        </div>

        <div>
          <label for="message" class="input-label">Message:</label>
          <p class="details">Provide the details of the topic (max 5000 characters)</p>
          <textarea id="body-content" name="message" required maxlength="5000"></textarea><br />
          <span id="message-counter">5000/5000</span>
        </div>

        <div>
          <label for="image" class="input-label">Image:</label>
          <p class="details">Select an image to include in your post (max 20 MB)</p>
          <input type="file" id="image" name="image" accept=".jpg,.jpeg,.png,.gif" />
        </div>

        <div class="tags" id="categories">
          <label class="input-label">Tags:</label>
          <div class="tag-input-container"></div>
        </div>
        <div class="error-container" id="error"></div>
        <button type="submit">Create Post</button>
      </form>
    </section>
  `;

  loadCSS('./css/pages/create-post.css');
  checkLoginStatus();
  createCategoryCheckboxes();
  validateImageUpload();
  validateTitleLength(100);
  validateMessageLength(5000);

  const form = document.getElementById("create-post-form");
  form.addEventListener("submit", createPost);
}