package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"real-time-forum/models"
	"regexp"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var user models.UserRegisteration
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate the input data
	emailRegex := `^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{1,}$`
	match, err := regexp.MatchString(emailRegex, user.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !match {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	// Validate age
	if user.Age <= 0 {
		http.Error(w, "Invalid age", http.StatusBadRequest)
		return
	}

	// Hash the user's password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	// Call CreateUser method to save the user in the database
	err = database.CreateUser(database.DB, user)
	if err != nil {
		http.Error(w, "Failed to insert into database", http.StatusInternalServerError)
		return
	}

	// Create a session for the user
	err = CreateSession(w, r, user)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return a success response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User registered successfully"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Define a custom struct for the login request
	type LoginRequest struct {
		NicknameOrEmail string `json:"nicknameOrEmail"`
		Password        string `json:"password"`
	}

	var loginReq LoginRequest
	err := json.NewDecoder(r.Body).Decode(&loginReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Retrieve the user by email or nickname
	var dbUser models.UserRegisteration
	if strings.Contains(loginReq.NicknameOrEmail, "@") {
		user, _ := database.GetUserByEmail(database.DB, loginReq.NicknameOrEmail)
		dbUser = user.(models.UserRegisteration)
	} else {
		user, _ := database.GetUserByNickname(database.DB, loginReq.NicknameOrEmail)
		dbUser = user.(models.UserRegisteration)
	}
	if dbUser.Nickname == "" {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	// Compare the hashed password with the provided password
	err = bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(loginReq.Password))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// Create a session for the user
	err = CreateSession(w, r, dbUser)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return the token in the response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login successful"))
}

func IsLoggedIn(w http.ResponseWriter, r *http.Request) {
	user, err := GetSessionUser(r)
	if err != nil {
		if err.Error() == "newer session found" {
			DestroySession(w, r)
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "not_logged_in"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":    "logged_in",
		"nickname":  user.Nickname,
		"sessionID": UserSessions[user.Nickname],
	})
}

func Logout(w http.ResponseWriter, r *http.Request) {
	user, err := GetSessionUser(r)
	if err != nil {
		delete(UserSessions, user.Nickname)
	}
	DestroySession(w, r)
	json.NewEncoder(w).Encode(map[string]string{"status": "logged_out"})
}
