package handlers

import (
	"encoding/json"
	"errors"
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
	parsedDOB, err := time.Parse(time.RFC3339, dob)
	if err != nil {
		return 0, err
	}
	now := time.Now()
	age := now.Year() - parsedDOB.Year()
	if now.YearDay() < parsedDOB.YearDay() {
		age--
	}
	if age < 0 {
		return 0, errors.New("invalid date of birth")
	}
	return age, nil
}
