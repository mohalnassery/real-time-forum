package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"real-time-forum/models"
	"strconv"
	"time"
)

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
	users, err := database.GetUsers()
	if err != nil {
		http.Error(w, "Failed to retrieve users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
