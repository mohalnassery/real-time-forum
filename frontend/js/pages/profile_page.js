import { fetchUserStats, fetchAllUserStats, fetchLeaderboard } from '../components/profile/profile_stats.js';
import { loadCSS } from '../components/utils.js';
import { fetchUserActivity, displayUserActivity } from '../components/profile/activity.js'; // Import functions from activity.js
import { showNotification } from '../components/notifications.js';

export function initProfilePage(app) {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const userID = urlParams.get('user_id');

    app.innerHTML = `
        <div class="main-container">
            <div class="left-section">
                <div class="profile-info" id="profile-info">
                    <h1>Profile Information</h1>
                    <div class="profile-item">
                        <p>First Name:</p>
                        <span id="profile-first-name"></span>
                    </div>
                    <div class="profile-item">
                        <p>Last Name:</p>
                        <span id="profile-last-name"></span>
                    </div>
                    <div class="profile-item">
                        <p>Age:</p>
                        <span id="profile-age"></span>
                    </div>
                    <div class="profile-item">
                        <p>Nickname:</p>
                        <span id="profile-nickname"></span>
                    </div>
                    <div class="profile-item">
                        <p>Gender:</p>
                        <span id="profile-gender"></span>
                    </div>
                </div>
                <div class="stats" id="user-stats">
                    <h1>Stats</h1>
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

    fetchUserProfile(userID);
    fetchUserStats(userID);
    fetchAllUserStats();
    fetchLeaderboard();
    fetchUserActivity(userID); // Fetch user activity

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

async function fetchUserProfile(userID) {
    try {
        const response = await fetch(`/user-profile?user_id=${userID}`);
        if (response.ok) {
            const profile = await response.json();
            const user = profile.user;
            const age = calculateAge(new Date(user.dob)); // Calculate age from dob
            document.getElementById("profile-first-name").textContent = user.first_name;
            document.getElementById("profile-last-name").textContent = user.last_name;
            document.getElementById("profile-age").textContent = age;
            document.getElementById("profile-nickname").textContent = user.nickname;
            document.getElementById("profile-gender").textContent = user.gender;
        } else {
            console.error("Failed to fetch user profile");
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

function calculateAge(dob) {
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
