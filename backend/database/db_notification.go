package database

import (
	"database/sql"
	"fmt"
	"real-time-forum/models"
	"time"
)

func InsertNotification(userID int, message string, tx *sql.Tx, messageID, postID, commentID int) error {
	var err error
	var query string

	if messageID != 0 {
		query = `
            INSERT INTO notifications (user_id, message, message_id, created_at, is_read)
            VALUES (?, ?, ?, ?, FALSE)
        `
	} else if commentID == 0 && messageID == 0 {
		query = `
            INSERT INTO notifications (user_id, message, post_id, created_at, is_read)
            VALUES (?, ?, ?, ?, FALSE)
        `
	} else if commentID != 0 {
		query = `
            INSERT INTO notifications (user_id, message, post_id, comment_id, created_at, is_read)
            VALUES (?, ?, ?, ?, ?, FALSE)
        `
	}

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
		if messageID != 0 {
			_, err = stmt.Exec(userID, message, messageID, time.Now())
		} else if commentID == 0 && messageID == 0 {
			_, err = stmt.Exec(userID, message, postID, time.Now())
		} else {
			_, err = stmt.Exec(userID, message, postID, commentID, time.Now())
		}
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
        SELECT notifications.id, notifications.message, notifications.message_id, notifications.post_id, notifications.comment_id, notifications.created_at, notifications.is_read, messages.sender_id
        FROM notifications
        LEFT JOIN messages ON notifications.message_id = messages.id
        WHERE notifications.user_id = ? AND notifications.is_read = FALSE
        ORDER BY notifications.created_at DESC
    `, userID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		var messageID sql.NullInt64
		var postID sql.NullInt64
		var commentID sql.NullInt64
		var senderID sql.NullInt64
		err := rows.Scan(&n.ID, &n.Message, &messageID, &postID, &commentID, &n.CreatedAt, &n.IsRead, &senderID)
		if err != nil {
			return nil, err
		}
		if messageID.Valid {
			n.MessageID = int(messageID.Int64)
		} else {
			n.MessageID = 0
		}
		if postID.Valid {
			n.PostID = int(postID.Int64)
		} else {
			n.PostID = 0
		}
		if commentID.Valid {
			n.CommentID = int(commentID.Int64)
		} else {
			n.CommentID = 0
		}
		if senderID.Valid {
			senderIDValue := int(senderID.Int64)
			n.SenderID = &senderIDValue
		} else {
			n.SenderID = nil
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
	// Ensure the transaction is committed before checking the existence
	if tx != nil {
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit transaction: %v", err)
		}
	}

	// Add a small delay to ensure the database has fully processed the commit
	time.Sleep(100 * time.Millisecond)

	// Check if messageID exists
	var exists bool
	err := DB.QueryRow("SELECT EXISTS(SELECT 1 FROM messages WHERE id = ?)", message.ID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check if messageID exists: %v", err)
	}
	if !exists {
		return fmt.Errorf("messageID %d does not exist in messages table", message.ID)
	}

	notificationMessage := "New message from " + message.SenderNickname
	return InsertNotification(message.ReceiverID, notificationMessage, nil, int(message.ID), 0, 0)
}
