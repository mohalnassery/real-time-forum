package database

import (
	"database/sql"
	"fmt"
	"real-time-forum/models"
	"time"
)

func InsertNotification(userID int, message string, tx *sql.Tx, messageID, postID, commentID int) error {
	// Check if messageID exists in the messages table
	var exists bool
	err := DB.QueryRow("SELECT EXISTS(SELECT 1 FROM messages WHERE id = ?)", messageID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check if messageID exists: %v", err)
	}
	if !exists {
		return fmt.Errorf("messageID %d does not exist in messages table", messageID)
	}

	query := `
        INSERT INTO notifications (user_id, message, message_id, post_id, comment_id, created_at, is_read)
        VALUES (?, ?, ?, ?, ?, ?, FALSE)
    `

	var stmt *sql.Stmt

	if tx != nil {
		stmt, err = tx.Prepare(query)
	} else {
		stmt, err = DB.Prepare(query)
	}
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %v", err)
	}
	defer stmt.Close()

	for attempts := 0; attempts < 5; attempts++ {
		_, err = stmt.Exec(userID, message, messageID, postID, commentID, time.Now())
		if err == nil {
			return nil
		}
		if err.Error() == "database is locked" {
			time.Sleep(time.Millisecond * 100)
		} else if err.Error() == "FOREIGN KEY constraint failed" {
			// Log more details about the foreign key constraint failure
			return fmt.Errorf("foreign key constraint failed: userID=%d, messageID=%d, postID=%d, commentID=%d, error=%v", userID, messageID, postID, commentID, err)
		} else {
			return fmt.Errorf("failed to execute statement: %v", err)
		}
	}
	return fmt.Errorf("failed to insert notification after 5 attempts: %v", err)
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
func CreateMessageNotification(message *models.Message, tx *sql.Tx) error {
	notificationMessage := "New message from " + message.SenderNickname
	return InsertNotification(message.ReceiverID, notificationMessage, tx, int(message.ID), 0, 0)
}
