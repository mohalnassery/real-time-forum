package websockets

import (
	"log"
	"net/http"
	"real-time-forum/models"
	"strconv"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan models.Message
	register   chan *Client
	unregister chan *Client
	status     map[int]string // Add this to track user status
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan models.Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		status:     make(map[int]string), // Initialize status map
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.status[client.id] = "online" // Set status to online
			h.broadcastStatusChange(client.id, "online")
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.status[client.id] = "offline" // Set status to offline
				h.broadcastStatusChange(client.id, "offline")
			}
		case message := <-h.broadcast:
			switch message.Type {
			case "chat":
				for client := range h.clients {
					if client.id == message.SenderID || client.id == message.ReceiverID {
						select {
						case client.send <- message:
						default:
							close(client.send)
							delete(h.clients, client)
						}
					}
				}
			case "status":
				// Handle status change messages
				userID := message.SenderID
				status := message.Content
				h.status[userID] = status
				for client := range h.clients {
					select {
					case client.send <- message:
					default:
						close(client.send)
						delete(h.clients, client)
					}
				}
			}
		}
	}
}

func (h *Hub) broadcastStatusChange(userID int, status string) {
	statusMessage := models.Message{
		Type:     "status",
		SenderID: userID,
		Content:  status,
	}
	for client := range h.clients {
		select {
		case client.send <- statusMessage:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
}

func (h *Hub) GetUsersWithStatus(users []models.User) []models.User {
	if h == nil || h.status == nil {
		log.Println("Hub or status map is nil")
		return users
	}
	for i := range users {
		if status, ok := h.status[users[i].ID]; ok {
			users[i].Status = status
		} else {
			users[i].Status = "offline"
		}
	}
	return users
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	clientId, err := strconv.Atoi(r.URL.Query().Get("clientId"))
	if err != nil {
		log.Println(err)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan models.Message, 256), id: clientId}
	client.hub.register <- client
	go client.writePump()
	go client.readPump()
}
