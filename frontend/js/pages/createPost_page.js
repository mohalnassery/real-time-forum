import { checkLoginStatus } from '../components/auth/auth_handling.js';

document.addEventListener("DOMContentLoaded", async () => {
    await checkLoginStatus();
    createCategoryCheckboxes();
    validateImageUpload();
});

function validateImageUpload() {
  const imageInput = document.getElementById("image");
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/tiff", "image/svg+xml"];
    const maxSize = 20 * 1024 * 1024; // 20 MB

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image file types are allowed.");
        imageInput.value = "";
      } else if (file.size > maxSize) {
        alert("File size exceeds the maximum limit of 20 MB.");
        imageInput.value = "";
      }
    }
  });
}

async function fetchCategories() {
  try {
    const response = await fetch("/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function createCategoryCheckboxes() {
  try {
    const categories = await fetchCategories();
    const categoryContainer = document.getElementById("category-container");
    if (categoryContainer) {
        categoryContainer.innerHTML = categories.map(category => `
            <label>
                <input type="checkbox" name="categories" value="${category.id}">
                ${category.name}
            </label>
        `).join('');
    }
  } catch (error) {
    console.error("Error creating category checkboxes:", error);
  }
}

async function createPost(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const file = formData.get("image");
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/tiff", "image/svg+xml"];
  const maxSize = 20 * 1024 * 1024; // 20 MB

  if (file) {
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and GIF file types are allowed.");
      return;
    } else if (file.size > maxSize) {
      alert("File size exceeds the maximum limit of 20 MB.");
      return;
    }
  }

  try {
    const response = await fetch("/posts", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // Post created successfully
      window.location.href = "/";
    } else {
      // Handle error response
      console.error("Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
  }
}

export function initCreatePost(mainContent) {
  mainContent.innerHTML = `
    <form id="create-post-form">
      <div>
        <label for="title" class="input-label">Title:</label>
        <p class="details">Be specific and summarize your topic</p>
        <input type="text" id="title" name="title" required /><br />
      </div>

      <div>
        <label for="message" class="input-label">Message:</label>
        <p class="details">Provide the details of the topic</p>
        <textarea id="body-content" name="message" required></textarea><br />
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
      <button type="submit">Post Topic</button>
    </form>
  `;

  checkLoginStatus();
  createCategoryCheckboxes();
  validateImageUpload();

  const form = document.getElementById("create-post-form");
  form.addEventListener("submit", createPost);
}