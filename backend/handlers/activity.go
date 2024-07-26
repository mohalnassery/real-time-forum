package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"strconv"
	"time"
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

	// Calculate age from dob
	user.Age, err = calculateAge(user.DOB)
	if err != nil {
		http.Error(w, "Failed to calculate age", http.StatusInternalServerError)
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

func calculateAge(dob string) (int, error) {
	// Adjust the layout to match the expected format without the time component
	parsedDOB, err := time.Parse("2006-01-02T15:04:05Z", dob)
	if err != nil {
		return 0, err
	}
	age := time.Now().Year() - parsedDOB.Year()
	if time.Now().YearDay() < parsedDOB.YearDay() {
		age--
	}
	return age, nil
}
