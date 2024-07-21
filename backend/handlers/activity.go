package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
)

func GetUserActivity(w http.ResponseWriter, r *http.Request) {
	user, err := GetSessionUser(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := database.GetUserID(user.Nickname)
	if err != nil {
		http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
		return
	}

	activity, err := database.GetUserActivity(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve user activity", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activity)
}
