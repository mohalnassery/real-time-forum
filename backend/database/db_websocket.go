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

// IsChatActive checks if there's an active chat session between two users
func IsChatActive(userID1, userID2 int) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM active_chats WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)",
		userID1, userID2, userID2, userID1).Scan(&count)
	return count > 0, err
}

// SetChatActive marks the chat as active for the specific pair of users
func SetChatActive(userID1, userID2 int) error {
	_, err := DB.Exec("INSERT OR REPLACE INTO active_chats (user_id1, user_id2) VALUES (?, ?)", userID1, userID2)
	return err
}

// SetChatInactive marks the chat as inactive for the specific pair of users
func SetChatInactive(userID1, userID2 int) error {
	_, err := DB.Exec("DELETE FROM active_chats WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)",
		userID1, userID2, userID2, userID1)
	return err
}
