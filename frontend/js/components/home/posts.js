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
        const username = localStorage.getItem("nickname"); // Ensure consistency with localStorage key
        const selectedCategories = []; // Add logic to get selected categories
        const filterLikes = false; // Add logic to get filterLikes
        const filterCreated = false; // Add logic to get filterCreated

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
    const categoryContainer = document.querySelector(".category-container");
    if (categoryContainer) {
        categories.forEach((category) => {
            const categoryElement = document.createElement("div");
            categoryElement.className = "category-item";
            categoryElement.textContent = category.name;
            categoryContainer.appendChild(categoryElement);
        });
    }
}

function displayPosts(posts) {
    const postsSection = document.querySelector(".posts-section");
    postsSection.innerHTML = ""; // Clear existing posts

    if (posts.length > 0) {
        posts.forEach((post) => {
            const postInfo = document.createElement("div");
            postInfo.className = "post-info";

            const title = document.createElement("h2");
            title.textContent = post.title;
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