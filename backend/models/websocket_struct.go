package models

import "time"

type Message struct {
	ID             int       `json:"id"`
	SenderID       int       `json:"senderId"`
	SenderNickname string    `json:"senderNickname"`
	ReceiverID     int       `json:"receiverId"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"createdAt"`
}
