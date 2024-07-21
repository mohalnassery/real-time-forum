import { fetchUserStats, fetchAllUserStats, fetchLeaderboard } from '../components/profile/profile_stats.js';
import { loadCSS } from '../components/utils.js';
import { fetchUserActivity, displayUserActivity } from '../components/profile/activity.js'; // Import functions from activity.js

export function initProfilePage(app) {
    app.innerHTML = `
        <div class="main-container">
            <div class="left-section">
                <div class="stats" id="user-stats">
                    <h1>My Stats</h1>
                    <div class="stat-item">
                        <p>Number of posts created:</p>
                        <span id="user-posts"></span>
                    </div>
                    <div class="stat-item">
                        <p>Number of comments:</p>
                        <span id="user-comments"></span>
                    </div>
                    <div class="stat-item">
                        <p>Number of Likes:</p>
                        <span id="user-likes"></span>
                    </div>
                    <div class="stat-item">
                        <p>Number of Dislikes:</p>
                        <span id="user-dislikes"></span>
                    </div>
                </div>
            </div>

            <div class="middle-section">
                <h1>User Activity</h1>
                <div class="tab">
                    <button class="tablinks" data-tab="CreatedPosts">Created Posts</button>
                    <button class="tablinks" data-tab="CreatedComments">Created Comments</button>
                    <button class="tablinks" data-tab="LikedPosts">Liked Posts</button>
                    <button class="tablinks" data-tab="DislikedPosts">Disliked Posts</button>
                    <button class="tablinks" data-tab="LikedComments">Liked Comments</button>
                    <button class="tablinks" data-tab="DislikedComments">Disliked Comments</button>
                </div>

                <div id="CreatedPosts" class="tabcontent">
                    <h3>Created Posts</h3>
                    <div id="created-posts-section"></div>
                </div>

                <div id="CreatedComments" class="tabcontent">
                    <h3>Created Comments</h3>
                    <div id="created-comments-section"></div>
                </div>

                <div id="LikedPosts" class="tabcontent">
                    <h3>Liked Posts</h3>
                    <div id="liked-posts-section"></div>
                </div>

                <div id="DislikedPosts" class="tabcontent">
                    <h3>Disliked Posts</h3>
                    <div id="disliked-posts-section"></div>
                </div>

                <div id="LikedComments" class="tabcontent">
                    <h3>Liked Comments</h3>
                    <div id="liked-comments-section"></div>
                </div>

                <div id="DislikedComments" class="tabcontent">
                    <h3>Disliked Comments</h3>
                    <div id="disliked-comments-section"></div>
                </div>
            </div>

            <div class="right-section">
                <div class="leaderboard">
                    <h1>LeaderBoard</h1>
                    <div id="user-leaderboard"></div>
                </div>
            </div>
        </div>
    `;

    fetchUserStats();
    fetchAllUserStats();
    fetchLeaderboard();
    fetchUserActivity(); // Fetch user activity

    // Add event listeners for tab buttons
    const tabLinks = document.querySelectorAll(".tablinks");
    tabLinks.forEach(button => {
        button.addEventListener("click", (event) => {
            openTab(event, button.getAttribute("data-tab"));
        });
    });

    // Open the first tab by default
    document.querySelector(".tablinks").click();
}

function openTab(event, tabName) {
    const tabContent = document.querySelectorAll(".tabcontent");
    const tabLinks = document.querySelectorAll(".tablinks");

    // Hide all tab content
    tabContent.forEach(content => {
        content.classList.remove("active");
    });

    // Remove active class from all tab links
    tabLinks.forEach(link => {
        link.classList.remove("active");
    });

    // Show the current tab and add active class to the button
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
}
