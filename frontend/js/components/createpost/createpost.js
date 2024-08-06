export function validateImageUpload() {
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

export async function fetchCategories() {
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

export async function createCategoryCheckboxes() {
  const categories = await fetchCategories();
  const container = document.querySelector(".tag-input-container");
  container.innerHTML = "";

  categories.forEach((category) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "options";
    checkbox.value = category;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + category));
    container.appendChild(label);
  });
}

export async function createPost(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const file = formData.get("image");
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/tiff", "image/svg+xml"];
  const maxSize = 20 * 1024 * 1024; // 20 MB

  if (file.name) {
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

export function validateTitleLength(maxLength) {
  const titleInput = document.getElementById("title");
  const titleCounter = document.getElementById("title-counter");
  
  titleInput.addEventListener("input", () => {
    const remainingChars = maxLength - titleInput.value.length;
    titleCounter.textContent = `${remainingChars}/${maxLength}`;
    
    if (remainingChars < 0) {
      titleInput.value = titleInput.value.slice(0, maxLength);
      titleCounter.textContent = `0/${maxLength}`;
    }
  });
}

export function validateMessageLength(maxLength) {
  const messageInput = document.getElementById("body-content");
  const messageCounter = document.getElementById("message-counter");
  
  messageInput.addEventListener("input", () => {
    const remainingChars = maxLength - messageInput.value.length;
    messageCounter.textContent = `${remainingChars}/${maxLength}`;
    
    if (remainingChars < 0) {
      messageInput.value = messageInput.value.slice(0, maxLength);
      messageCounter.textContent = `0/${maxLength}`;
    }
  });
}