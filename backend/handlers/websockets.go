package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"real-time-forum/models"
	"real-time-forum/websockets"
	"strconv"
	"time"
)

var hub *websockets.Hub

func InitHub(h *websockets.Hub) {
	hub = h
}

func GetMessagesHandler(w http.ResponseWriter, r *http.Request) {
	senderID, err := strconv.Atoi(r.URL.Query().Get("sender_id"))
	if err != nil {
		http.Error(w, "Invalid sender ID", http.StatusBadRequest)
		return
	}
	receiverID, err := strconv.Atoi(r.URL.Query().Get("receiver_id"))
	if err != nil {
		http.Error(w, "Invalid receiver ID", http.StatusBadRequest)
		return
	}

	messages, err := database.GetMessagesByUserIDs(senderID, receiverID)
	if err != nil {
		http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	var message models.Message
	err := json.NewDecoder(r.Body).Decode(&message)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set the creation time to the current time
	message.CreatedAt = time.Now()

	err = database.CreateMessage(&message)
	if err != nil {
		http.Error(w, "Failed to send message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	// use GetSessionUser to get the logged in user ID
	loggedInUser, err := GetSessionUser(r)
	if err != nil {
		http.Error(w, "Failed to retrieve logged in user ID", http.StatusInternalServerError)
		return
	}

	loggedInUserID := loggedInUser.UserId

	users, err := database.GetUsers(loggedInUserID)
	if err != nil {
		http.Error(w, "Failed to retrieve users", http.StatusInternalServerError)
		return
	}

	if hub == nil {
		http.Error(w, "Hub is not initialized", http.StatusInternalServerError)
		return
	}

	usersWithStatus := hub.GetUsersWithStatus(users)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(usersWithStatus)
}
