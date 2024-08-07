package database

import (
	"database/sql"
	"real-time-forum/models"
	"time"
)

func InsertNotification(userID int, message string, senderID int, postID int, tx *sql.Tx) error {
	var err error
	if tx != nil {
		_, err = tx.Exec("INSERT INTO notifications (user_id, message, sender_id, post_id, created_at) VALUES (?, ?, ?, ?, ?)",
			userID, message, senderID, postID, time.Now())
	} else {
		_, err = DB.Exec("INSERT INTO notifications (user_id, message, sender_id, post_id, created_at) VALUES (?, ?, ?, ?, ?)",
			userID, message, senderID, postID, time.Now())
	}
	return err
}

func GetUnreadNotificationCount(userID int) (int, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0", userID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func GetNotifications(userID int) ([]models.Notification, error) {
	rows, err := DB.Query("SELECT id, message, created_at, is_read FROM notifications WHERE user_id = ? ORDER BY created_at DESC", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(&notification.ID, &notification.Message, &notification.CreatedAt, &notification.IsRead)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func ClearNotification(notificationID int) (int, error) {
	var postID int
	err := DB.QueryRow("SELECT post_id FROM notifications WHERE id = ?", notificationID).Scan(&postID)
	if err != nil {
		return 0, err
	}

	_, err = DB.Exec("UPDATE notifications SET is_read = 1 WHERE id = ?", notificationID)
	if err != nil {
		return 0, err
	}

	return postID, nil
}

func MarkAllNotificationsAsRead(userID int) error {
	_, err := DB.Exec("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", userID)
	return err
}
