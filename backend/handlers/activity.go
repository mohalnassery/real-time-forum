package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"strconv"
)

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid User ID", http.StatusBadRequest)
		return
	}

	user, err := database.GetUserProfile(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve user profile", http.StatusInternalServerError)
		return
	}

	activity, err := database.GetUserActivity(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve user activity", http.StatusInternalServerError)
		return
	}

	response := struct {
		User     interface{} `json:"user"`
		Activity interface{} `json:"activity"`
	}{
		User:     user,
		Activity: activity,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
