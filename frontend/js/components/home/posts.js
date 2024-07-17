import {
  getSelectedCategories,
  getFilterLikes,
  getFilterCreated,
  getNickname,
  updateSelectedCategories,
} from './filtering.js';

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

export async function fetchPosts() {
    try {
        let url = "/posts?";
        const nickname = getNickname();
        const selectedCategories = getSelectedCategories();
        const filterLikes = getFilterLikes();
        const filterCreated = getFilterCreated();

        selectedCategories.length > 0 && (url += `&category=${selectedCategories}`);
        filterLikes && (url += `&liked=${nickname}`);
        filterCreated && (url += `&created=${nickname}`);
        const res = await fetch(url, {
            method: "GET",
        });
        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage);
        }
        const postsStr = await res.text();
        const posts = JSON.parse(postsStr);
        displayPosts(posts);
    } catch (error) {
        console.log(error.message);
    }
}

export async function createCategoryElements() {
    const categories = await fetchCategories();
    const containers = document.querySelectorAll(".category-container");
  
    containers.forEach((container) => {
      container.innerHTML = "";
  
      categories.forEach((category) => {
        const categoryElement = document.createElement("div");
        categoryElement.className = "individual-category";
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", () => {
          updateSelectedCategories(category);
          categoryElement.classList.toggle("selected");
        });
        container.appendChild(categoryElement);
      });
    });
  }

function displayPosts(posts) {
  const postsSection = document.querySelector(".posts-section");

  // Clear the existing posts
  postsSection.innerHTML = "";

  if (posts && posts.length > 0) {
    // For loop to create and append post elements
    posts.forEach((post) => {
      const postInfo = document.createElement("div");
      postInfo.className = "post-info";

      const top = document.createElement("div");
      top.className = "top";

      const right = document.createElement("div");
      right.className = "right";

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = post.author.charAt(0).toUpperCase();
      right.appendChild(avatar);

      const authorInfo = document.createElement("p");
      authorInfo.innerHTML = `${post.author} <span>• ${new Date(
        post.creationdate
      ).toLocaleDateString()}</span>`;
      right.appendChild(authorInfo);

      top.appendChild(right);

      const left = document.createElement("div");
      left.className = "left";

      const likeStats = document.createElement("div");
      likeStats.className = "post-stats";
      likeStats.id = "like";
      const likeIcon = document.createElement("i");
      likeIcon.className = "fa-solid fa-thumbs-up";
      likeStats.appendChild(likeIcon);
      const likeNumber = document.createElement("p");
      likeNumber.className = "number";
      likeNumber.textContent = post.likes;
      likeStats.appendChild(likeNumber);
      left.appendChild(likeStats);

      const dislikeStats = document.createElement("div");
      dislikeStats.className = "post-stats";
      dislikeStats.id = "dislike";
      const dislikeIcon = document.createElement("i");
      dislikeIcon.className = "fa-solid fa-thumbs-down";
      dislikeStats.appendChild(dislikeIcon);
      const dislikeNumber = document.createElement("p");
      dislikeNumber.className = "number";
      dislikeNumber.textContent = post.dislikes;
      dislikeStats.appendChild(dislikeNumber);
      left.appendChild(dislikeStats);

      const commentStats = document.createElement("div");
      commentStats.className = "post-stats";
      commentStats.id = "comment";
      const commentIcon = document.createElement("i");
      commentIcon.className = "fa-solid fa-comment";
      commentStats.appendChild(commentIcon);
      const commentNumber = document.createElement("p");
      commentNumber.className = "number";
      commentNumber.textContent = post.commentCount;
      commentStats.appendChild(commentNumber);
      left.appendChild(commentStats);

      top.appendChild(left);

      postInfo.appendChild(top);

      const title = document.createElement("h2");
      title.textContent = post.title;

      // Include the postId in the URL when navigating to the post details page
      postInfo.addEventListener("click", () => {
        window.location.hash = `#post/${post.post_id}`;
      });
      postInfo.appendChild(title);

      const tags = document.createElement("div");
      tags.className = "tags";
      if (post.categories && post.categories.length > 0) {
        post.categories.forEach((category) => {
          const tag = document.createElement("div");
          tag.textContent = category;
          tags.appendChild(tag);
        });
      }
      postInfo.appendChild(tags);

      postsSection.appendChild(postInfo);
    });
  } else {
    // Display a message when there are no posts
    const noPostsMessage = document.createElement("p");
    noPostsMessage.textContent = "No posts available.";
    postsSection.appendChild(noPostsMessage);
  }
}
