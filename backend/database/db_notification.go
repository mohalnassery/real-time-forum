package database

import (
	"database/sql"
	"real-time-forum/models"
	"time"
)

func InsertNotification(userID int, message string, tx *sql.Tx, messageID, postID, commentID int) error {
	query := `
        INSERT INTO notifications (user_id, message, message_id, post_id, comment_id, created_at, is_read)
        VALUES (?, ?, ?, ?, ?, ?, FALSE)
    `
	var err error
	if tx != nil {
		_, err = tx.Exec(query, userID, message, messageID, postID, commentID, time.Now())
	} else {
		_, err = DB.Exec(query, userID, message, messageID, postID, commentID, time.Now())
	}
	return err
}

func GetUnreadNotificationCount(userID int) (int, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE", userID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func GetNotifications(userID int) ([]models.Notification, error) {
	rows, err := DB.Query(`
        SELECT id, message, message_id, post_id, comment_id, created_at, is_read
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		err := rows.Scan(&n.ID, &n.Message, &n.MessageID, &n.PostID, &n.CommentID, &n.CreatedAt, &n.IsRead)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}

	return notifications, nil
}

func ClearNotification(notificationID int64) error {
	_, err := DB.Exec("UPDATE notifications SET is_read = TRUE WHERE id = ?", notificationID)
	return err
}

func MarkAllNotificationsAsRead(userID int) error {
	_, err := DB.Exec("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", userID)
	return err
}

// New function to mark all chat notifications as read for a specific sender
func MarkAllChatNotificationsAsRead(receiverID, senderID int) error {
	_, err := DB.Exec(`
		UPDATE notifications 
		SET is_read = TRUE 
		WHERE user_id = ? AND message_id IN (
			SELECT id FROM messages WHERE sender_id = ? AND receiver_id = ?
		) AND is_read = FALSE`,
		receiverID, senderID, receiverID)
	return err
}

// New function to create a notification for a new message
func CreateMessageNotification(message *models.Message) error {
	notificationMessage := "New message from " + message.SenderNickname
	return InsertNotification(message.ReceiverID, notificationMessage, nil, int(message.ID), 0, 0)
}
