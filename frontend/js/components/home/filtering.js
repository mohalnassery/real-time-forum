import { fetchPosts } from './posts.js';

let selectedCategories = [];
let filterLikes = false;
let filterCreated = false;
let nickname = "";


export function createFilterListeners() {
  const optionsContainers = document.querySelectorAll(".options");

  optionsContainers.forEach((options) => {
    if (options) {
      for (const option of options.children) {
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

export function getNickname() {
  return nickname;
}

export function setNickname(newNickname) {
  nickname = newNickname;
}