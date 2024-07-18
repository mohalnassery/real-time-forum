export function loadCSS(href) {

    const defaultCSS = ['./css/components/nav.css', './css/styles.css', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css']; 
    const link = document.createElement('link');

    // Remove existing stylesheets
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    existingLinks.forEach(link => link.remove());

    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);

    defaultCSS.forEach((defaultHref) => {
        if (defaultHref !== href) {
            const defaultLink = document.createElement('link');
            defaultLink.rel = 'stylesheet';
            defaultLink.href = defaultHref;
            document.head.appendChild(defaultLink);
        }
    });
}
