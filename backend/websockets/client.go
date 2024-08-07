package websockets

import (
	"encoding/json"
	"fmt"
	"log"
	"real-time-forum/database"
	"real-time-forum/models"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan models.Message
	id   int
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		var message models.Message
		err := c.conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// Use senderId directly from the message
		if message.SenderID == 0 {
			log.Printf("error: senderId is missing")
			continue
		}

		// Retrieve sender nickname from the database
		sender, err := database.GetUsernameByID(message.SenderID)
		if err != nil {
			log.Printf("error retrieving sender nickname: %v", err)
			continue
		}
		message.SenderNickname = sender

		// Set the creation time to the current time
		message.CreatedAt = time.Now()

		// Only save chat messages to the database
		if message.Type == "chat" {
			// if message is not empty and not over 500 characters
			if message.Content != "" && len(message.Content) < 500 {
				err = database.CreateMessage(&message)
				if err != nil {
					log.Printf("error saving message: %v", err)
					continue
				}
			}

			isActive, _ := database.IsChatActive(message.ReceiverID, message.SenderID)
			if !isActive {
				// Create a notification only if the chat is not active between these two users
				notificationMessage := fmt.Sprintf("New message from %s", message.SenderNickname)
				database.InsertNotification(message.ReceiverID, notificationMessage, message.SenderID, 0, nil)
			}
		} else if message.Type == "chat_opened" {
			c.hub.SetChatActive(message.SenderID, message.ReceiverID)
		} else if message.Type == "chat_closed" {
			c.hub.SetChatInactive(message.SenderID, message.ReceiverID)
		}

		c.hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			json.NewEncoder(w).Encode(message)

			n := len(c.send)
			for i := 0; i < n; i++ {
				json.NewEncoder(w).Encode(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
