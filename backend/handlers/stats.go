package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"real-time-forum/models"
	"strconv"
)

func GetUserStats(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userId, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid User ID", http.StatusBadRequest)
		return
	}

	// Get user's stats
	var stats models.UserStats

	// Count user's posts
	err = database.DB.QueryRow("SELECT COUNT(*) FROM posts WHERE author = ?", userId).Scan(&stats.Posts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Count user's comments
	err = database.DB.QueryRow("SELECT COUNT(*) FROM comments WHERE author = ?", userId).Scan(&stats.Comments)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Count user's likes on posts
	err = database.DB.QueryRow(`SELECT COUNT(*) FROM "like-posts" WHERE user_id = ?`, userId).Scan(&stats.Likes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Count user's dislikes on posts
	err = database.DB.QueryRow(`SELECT COUNT(*) FROM "dislike-posts" WHERE user_id = ?`, userId).Scan(&stats.Dislikes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetAllStats(w http.ResponseWriter, r *http.Request) {
	var stats models.AllStats

	// Count total posts
	err := database.DB.QueryRow("SELECT COUNT(*) FROM posts").Scan(&stats.TotalPosts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Count total comments
	err = database.DB.QueryRow("SELECT COUNT(*) FROM comments").Scan(&stats.TotalComments)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Count total likes
	err = database.DB.QueryRow(`SELECT (SELECT COUNT(*) FROM "like-posts")+(SELECT COUNT(*) FROM "like-comments") AS SumCount`).Scan(&stats.TotalLikes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Count total dislikes
	err = database.DB.QueryRow(`SELECT (SELECT COUNT(*) FROM "dislike-posts")+(SELECT COUNT(*) FROM "dislike-comments") AS SumCount`).Scan(&stats.TotalDislikes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	var leaderboard []models.LeaderboardEntry

	rows, err := database.DB.Query("SELECT u.nickname, COUNT(p.post_id) AS post_count FROM users u LEFT JOIN posts p ON u.id = p.author GROUP BY u.id HAVING COUNT(p.post_id) > 0 ORDER BY post_count DESC LIMIT 10")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var entry models.LeaderboardEntry
		err := rows.Scan(&entry.Nickname, &entry.PostCount)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		leaderboard = append(leaderboard, entry)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(leaderboard)
}
