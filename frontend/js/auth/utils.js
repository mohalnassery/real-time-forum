export function showSection(sectionId) {
    document.getElementById("register").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("mainContent").style.display = "none";
    document.getElementById(sectionId).style.display = "block";
}