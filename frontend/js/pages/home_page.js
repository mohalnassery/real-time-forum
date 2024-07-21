import { fetchPosts, createCategoryElements } from '../components/home/posts.js';
import { fetchUserStats, fetchAllUserStats, fetchLeaderboard } from '../components/home/stats.js';
import { createFilterListeners } from '../components/home/filtering.js';

export function initContent(app) {
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
                <div class="stats" id="alluser-stats">
                    <h1>Forum Statistics</h1>
                    <div class="stat-item">
                        <p>Total number of posts:</p>
                        <span id="total-posts"></span>
                    </div>
                    <div class="stat-item">
                        <p>Total number of comments:</p>
                        <span id="total-comments"></span>
                    </div>
                    <div class="stat-item">
                        <p>Total number of likes:</p>
                        <span id="total-likes"></span>
                    </div>
                    <div class="stat-item">
                        <p>Total number of dislikes:</p>
                        <span id="total-dislikes"></span>
                    </div>
                </div>
                <div class="stats" id="categories">
                    <h1>Filter By Category</h1>
                    <div class="category-container"></div>
                </div>
            </div>
            <div class="middle-section">
                <div class="create-section">
                    <h1>All Posts</h1>
                    <button id="create-btn" onclick="window.location.hash='#create-post'">Create Post</button>
                </div>
                <div class="posts-section"></div>
            </div>
            <div class="right-section">
                <div class="leaderboard">
                    <h1>LeaderBoard</h1>
                    <div id="user-leaderboard"></div>
                </div>
                <div class="filter-options" id="user-filters">
                    <h1>Filter By</h1>
                    <div class="options">
                        <div>Created Posts</div>
                        <div>Liked Posts</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Fetch initial data
    fetchPosts();
    fetchUserStats();
    fetchAllUserStats();
    fetchLeaderboard();
    createCategoryElements();
    createFilterListeners(); // Add this line to initialize filter listeners
}
