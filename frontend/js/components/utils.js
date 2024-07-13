export function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

export function unloadCSS(href) {
    const links = document.querySelectorAll(`link[href="${href}"]`);
    links.forEach(link => link.parentNode.removeChild(link));
}