package models

import "time"

type Notification struct {
	ID        int       `json:"id"`
	Message   string    `json:"message"`
	MessageID int       `json:"messageId"`
	PostID    int       `json:"postId"`
	CommentID int       `json:"commentId"`
	CreatedAt time.Time `json:"createdAt"`
	IsRead    bool      `json:"isRead"`
}
