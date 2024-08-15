// Function to fetch and display user stats
export async function fetchUserStats(userID) {
    try {
        const response = await fetch(`/user-stats?user_id=${userID}`);
        if (response.ok) {
            const data = await response.json();

            // Display user stats
            document.querySelectorAll("#user-posts").forEach((element) => {
                element.classList.add("hidden"); // Add hidden class initially
                element.textContent = data.posts;
                // Trigger the animation after setting the content
                setTimeout(() => {
                    element.classList.remove("hidden");
                    element.classList.add("animate-on-load");
                }, 100);
            });
            document.querySelectorAll("#user-comments").forEach((element) => {
                element.classList.add("hidden"); // Add hidden class initially
                element.textContent = data.comments;
                // Trigger the animation after setting the content
                setTimeout(() => {
                    element.classList.remove("hidden");
                    element.classList.add("animate-on-load");
                }, 100);
            });
            document.querySelectorAll("#user-likes").forEach((element) => {
                element.classList.add("hidden"); // Add hidden class initially
                element.textContent = data.likes;
                // Trigger the animation after setting the content
                setTimeout(() => {
                    element.classList.remove("hidden");
                    element.classList.add("animate-on-load");
                }, 100);
            });
            document.querySelectorAll("#user-dislikes").forEach((element) => {
                element.classList.add("hidden"); // Add hidden class initially
                element.textContent = data.dislikes;
                // Trigger the animation after setting the content
                setTimeout(() => {
                    element.classList.remove("hidden");
                    element.classList.add("animate-on-load");
                }, 100);
            });
        } else {
            console.error("Error fetching user stats:", response.status);
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
    }
}

// Function to fetch and display all user stats
export async function fetchAllUserStats() {
    try {
        const response = await fetch("/all-stats");
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
        const stats = await response.json();

        document.querySelectorAll("#total-posts").forEach((element) => {
            element.classList.add("hidden"); // Add hidden class initially
            element.textContent = stats.totalPosts;
            // Trigger the animation after setting the content
            setTimeout(() => {
                element.classList.remove("hidden");
                element.classList.add("animate-on-load");
            }, 100);
        });
        document.querySelectorAll("#total-comments").forEach((element) => {
            element.classList.add("hidden"); // Add hidden class initially
            element.textContent = stats.totalComments;
            // Trigger the animation after setting the content
            setTimeout(() => {
                element.classList.remove("hidden");
                element.classList.add("animate-on-load");
            }, 100);
        });
        document.querySelectorAll("#total-likes").forEach((element) => {
            element.classList.add("hidden"); // Add hidden class initially
            element.textContent = stats.totalLikes;
            // Trigger the animation after setting the content
            setTimeout(() => {
                element.classList.remove("hidden");
                element.classList.add("animate-on-load");
            }, 100);
        });
        document.querySelectorAll("#total-dislikes").forEach((element) => {
            element.classList.add("hidden"); // Add hidden class initially
            element.textContent = stats.totalDislikes;
            // Trigger the animation after setting the content
            setTimeout(() => {
                element.classList.remove("hidden");
                element.classList.add("animate-on-load");
            }, 100);
        });
    } catch (error) {
        console.log(error.message);
    }
}

// Function to fetch and display the leaderboard
export async function fetchLeaderboard() {
    try {
        const response = await fetch("/leaderboard");
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
        const leaderboard = await response.json();

        const leaderboardContainers =
            document.querySelectorAll("#user-leaderboard");

        leaderboardContainers.forEach((leaderboardContainer) => {
            leaderboardContainer.innerHTML = ""; // Clear existing content

            leaderboard.forEach((user) => {
                const userProfile = document.createElement("div");
                userProfile.className = "user-profile hidden"; // Add hidden class initially

                const userData = document.createElement("div");
                userData.className = "user-data";

                const avatar = document.createElement("div");
                avatar.className = "avatar";
                avatar.textContent = user.nickname.charAt(0).toUpperCase(); // Display first letter of nickname as avatar
                userData.appendChild(avatar);

                const nickname = document.createElement("p");
                nickname.textContent = user.nickname;
                userData.appendChild(nickname);

                userProfile.appendChild(userData);

                const postCount = document.createElement("p");
                postCount.textContent = user.postCount;
                userProfile.appendChild(postCount);

                leaderboardContainer.appendChild(userProfile);

                // Trigger the animation after appending the element
                setTimeout(() => {
                    userProfile.classList.remove("hidden");
                    userProfile.classList.add("animate-on-load");
                }, 100);
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}