package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"strconv"
	"strings"
)

func GetNotifications(w http.ResponseWriter, r *http.Request) {
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

	notifications, err := database.GetNotifications(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve notifications", http.StatusInternalServerError)
		return
	}

	unreadCount, err := database.GetUnreadNotificationCount(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve unread notification count", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"notifications": notifications,
		"unreadCount":   unreadCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func ClearNotification(w http.ResponseWriter, r *http.Request) {
	urlParts := strings.Split(r.URL.Path, "/")
	if len(urlParts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	notificationID, err := strconv.Atoi(urlParts[3])
	if err != nil {
		http.Error(w, "Invalid notification ID", http.StatusBadRequest)
		return
	}

	err = database.ClearNotification(int64(notificationID))
	if err != nil {
		http.Error(w, "Failed to clear notification", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func MarkAllNotificationsAsRead(w http.ResponseWriter, r *http.Request) {
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

	err = database.MarkAllNotificationsAsRead(userID)
	if err != nil {
		http.Error(w, "Failed to mark all notifications as read", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func MarkChatNotificationsAsRead(w http.ResponseWriter, r *http.Request) {
	user, err := GetSessionUser(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := strconv.Atoi(r.URL.Path[len("/notifications/mark-chat-read/"):])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	err = database.MarkAllChatNotificationsAsRead(user.UserId, userID)
	if err != nil {
		http.Error(w, "Failed to mark chat notifications as read", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
