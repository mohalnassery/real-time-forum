export function loadCSS(href) {

    const defaultCSS = ['./css/components/nav.css', './css/styles.css', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css']; 
    const link = document.createElement('link');

    // Function to extract the path part of a URL
    function getPath(url) {
        const a = document.createElement('a');
        a.href = url;
        return a.pathname;
    }

    // Remove existing stylesheets except default ones
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    existingLinks.forEach(link => {
        if (!defaultCSS.some(defaultHref => getPath(defaultHref) === getPath(link.href)) && getPath(link.href) !== getPath(href)) {
            link.remove();
        }
    });

    // Load the specified href
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);

    // Load default stylesheets if not already loaded
    defaultCSS.forEach((defaultHref) => {
        if (defaultHref !== href && !Array.from(existingLinks).some(link => getPath(link.href) === getPath(defaultHref))) {
            const defaultLink = document.createElement('link');
            defaultLink.rel = 'stylesheet';
            defaultLink.href = defaultHref;
            document.head.appendChild(defaultLink);
        }
    });
}