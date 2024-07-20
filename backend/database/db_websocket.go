package database

import (
	"real-time-forum/models"
)

// CreateMessage inserts a new message into the database
func CreateMessage(message *models.Message) error {
	_, err := DB.Exec("INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?)",
		message.SenderID, message.ReceiverID, message.Content, message.CreatedAt)
	return err
}

// GetMessagesByUserIDs retrieves messages between two users
func GetMessagesByUserIDs(senderID, receiverID int) ([]models.Message, error) {
	rows, err := DB.Query(`
		SELECT id, sender_id, receiver_id, content, created_at
		FROM messages
		WHERE (sender_id = ? AND receiver_id = ?)
		   OR (sender_id = ? AND receiver_id = ?)
		ORDER BY created_at ASC
	`, senderID, receiverID, receiverID, senderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		err := rows.Scan(&message.ID, &message.SenderID, &message.ReceiverID, &message.Content, &message.CreatedAt)
		if err != nil {
			return nil, err
		}
		// Retrieve sender nickname
		sender, err := GetUsernameByID(message.SenderID)
		if err != nil {
			return nil, err
		}
		message.SenderNickname = sender
		messages = append(messages, message)
	}
	return messages, nil
}
