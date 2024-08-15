import { fetchPosts } from './posts.js';

let selectedCategories = [];
let filterLikes = false;
let filterCreated = false;


export function createFilterListeners() {
  const optionsContainers = document.querySelectorAll(".options");

  optionsContainers.forEach((options) => {
    if (options) {
      for (const option of options.children) {
        option.classList.add("hidden"); // Add hidden class initially
        switch (option.innerHTML) {
          case "Created Posts":
            option.addEventListener("click", () => {
              filterCreated = !filterCreated;
              option.style.backgroundColor = filterCreated ? "green" : "";
              option.style.color = filterCreated ? "white" : "";
              fetchPosts();
            });
            break;
          case "Liked Posts":
            option.addEventListener("click", () => {
              filterLikes = !filterLikes;
              option.style.backgroundColor = filterLikes ? "green" : "";
              option.style.color = filterLikes ? "white" : "";
              fetchPosts();
            });
            break;
        }
        // Trigger the animation after appending the element
        setTimeout(() => {
          option.classList.remove("hidden");
          option.classList.add("animate-on-load");
        }, 100);
      }
    }
  });
}

export function updateSelectedCategories(category) {
  if (selectedCategories.includes(category)) {
    selectedCategories = selectedCategories.filter((cat) => cat !== category);
  } else {
    selectedCategories.push(category);
  }
  fetchPosts();
}

export function getSelectedCategories() {
  return selectedCategories;
}

export function getFilterLikes() {
  return filterLikes;
}

export function getFilterCreated() {
  return filterCreated;
}