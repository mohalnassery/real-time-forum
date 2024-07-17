//window.addEventListener("storage", (event) => {
//    if (event.key === "logout") {
//        // Perform logout actions
//        isLoggedIn = false;
//        document.getElementById("login-btn").style.display = "inline-block";
//        document.getElementById("signup-btn").style.display = "inline-block";
//        document.getElementById("logout-btn").style.display = "none";
//        document.querySelector(".notification-icon").style.display = "none"; // Hide bell icon
//        document.getElementById("nickname").textContent = "";
//
//        // Remove the stored session ID
//        localStorage.removeItem("sessionID");
//    }
//});

export async function logout() {
    try {
        const response = await fetch("/auth/logout", { method: "POST" });
        if (response.ok) {
            window.location.href = "/";
        } else {
            console.error("Logout failed");
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

// check login status
export async function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      window.location.href = "/login";
    }
  }
