export function createBurgerMenu() {
    const header = document.querySelector(".header");
    if (!header) return;

    const burgerMenu = document.createElement("div");
    burgerMenu.className = "burger-menu";
    burgerMenu.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    header.appendChild(burgerMenu);

    burgerMenu.addEventListener("click", toggleSideMenu);
}

export function createSideMenu() {
    const sideMenu = document.createElement("div");
    sideMenu.className = "side-menu";

    const leftSection = document.querySelector(".left-section");
    const rightSection = document.querySelector(".right-section");

    if (leftSection) {
        const leftSectionClone = leftSection.cloneNode(true);
        sideMenu.appendChild(leftSectionClone);
    }

    if (rightSection) {
        const rightSectionClone = rightSection.cloneNode(true);
        sideMenu.appendChild(rightSectionClone);
    }

    document.body.appendChild(sideMenu);
}

export function toggleSideMenu() {
    const sideMenu = document.querySelector(".side-menu");
    if (sideMenu) {
        sideMenu.classList.toggle("active");
    }
}

export function handleResize() {
    const sideMenu = document.querySelector(".side-menu");
    if (window.innerWidth > 768 && sideMenu) {
        sideMenu.classList.remove("active");
    }
}

export function handleOutsideClick(event) {
    const sideMenu = document.querySelector(".side-menu");
    const burgerMenu = document.querySelector(".burger-menu");
    if (sideMenu && burgerMenu && !sideMenu.contains(event.target) && !burgerMenu.contains(event.target)) {
        sideMenu.classList.remove("active");
    }
}