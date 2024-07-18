### WebSocket Integration Plan

#### Prior Information Needed to Know
1. **Current Backend Structure**: Understanding the existing backend structure, especially the WebSocket implementation.
2. **Current Frontend Structure**: Understanding the existing frontend structure, especially the WebSocket implementation.
3. **User Data**: Ensure the backend can provide a list of users.
4. **WebSocket Communication**: Ensure the WebSocket can handle user-specific messages.

#### Objectives and Method
1. **Objective**: Implement a Discord-like user interface where clicking on a user icon in the navigation bar opens a sliding sidebar showing all users. Clicking on a user opens a chat box at the bottom of the screen.
2. **Method**: 
   - **Backend**: Adjust the backend to provide a list of users and handle user-specific WebSocket messages.
   - **Frontend**: Implement the UI for the sliding sidebar and chat box, and handle WebSocket communication.

#### Detailed To-Do List

1. **Backend Adjustments**
   - **Provide List of Users**:
     - Create a new handler to fetch the list of users.
     - Adjust the database to support fetching user data.
   - **Handle User-Specific Messages**:
     - Adjust the WebSocket hub to handle user-specific messages.
     - Ensure the client can send and receive messages to/from specific users.

2. **Frontend Adjustments**
   - **Navigation Bar**:
     - Add a user icon to the navigation bar.
     - Implement the sliding sidebar to show the list of users.
   - **Chat Box**:
     - Implement a chat box that appears at the bottom of the screen when a user is selected.
     - Handle sending and receiving messages via WebSocket.

### Backend Adjustments

#### 1. Provide List of Users

**File**: `backend/handlers/users.go`
```go
package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
)

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := database.GetUsers()
	if err != nil {
		http.Error(w, "Failed to retrieve users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
```

**File**: `backend/database/db_user.go`
```go
package database

import "real-time-forum/models"

func GetUsers() ([]models.User, error) {
	rows, err := DB.Query("SELECT id, nickname FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Nickname); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
```

#### 2. Handle User-Specific Messages

**File**: `backend/websockets/hub.go`
```go
package websockets

import (
	"log"
	"net/http"
	"real-time-forum/models"

	"github.com/gorilla/websocket"
)


