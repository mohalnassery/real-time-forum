package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
	"real-time-forum/models"
	"regexp"
	"strings"
	"time"

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
	if len(user.Email) > 320 {
		http.Error(w, "Email should be less than 320 characters", http.StatusBadRequest)
		return
	}
	match, err := regexp.MatchString(emailRegex, user.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !match {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	// Adjust the layout to match the expected format without the time component
	parsedDOB, err := time.Parse("2006-01-02", user.DOB)
	if err != nil {
		http.Error(w, "Failed to parse date of birth", http.StatusBadRequest)
		return
	}
	age := time.Now().Year() - parsedDOB.Year()
	if time.Now().YearDay() < parsedDOB.YearDay() {
		age--
	}

	// if nickname is too long or too short
	if len(user.Nickname) > 20 || len(user.Nickname) < 3 {
		http.Error(w, "Nickname is too long or too short", http.StatusBadRequest)
		return
	}

	// if nickname isn't alphanumeric
	match, err = regexp.MatchString(`^[a-zA-Z0-9]+$`, user.Nickname)
	if err != nil || !match {
		http.Error(w, "Nickname is not alphanumeric", http.StatusBadRequest)
		return
	}
	// Validate age
	if age <= 5 {
		http.Error(w, "Invalid age, you need to be 6 years old or greater", http.StatusBadRequest)
		return
	}

	// check if the nickname is already taken
	_, err = database.GetUserByNickname(user.Nickname)
	if err == nil {
		http.Error(w, "Nickname already taken", http.StatusBadRequest)
		return
	}

	// check if the email is already taken
	_, err = database.GetUserByEmail(user.Email)
	if err == nil {
		http.Error(w, "Email already taken", http.StatusBadRequest)
		return
	}

	// Hash the user's password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	user.AuthType = "local"

	// Call CreateUser method to save the user in the database
	err = database.CreateUser(user)
	if err != nil {
		http.Error(w, "Failed to insert into database", http.StatusInternalServerError)
		return
	}

	// Retrieve the user ID
	userId, err := database.GetUserID(user.Nickname)
	if err != nil {
		http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
		return
	}

	// Create a session for the user
	err = CreateSession(w, r, user)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Return a success response with the user ID
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered successfully",
		"userId":  userId,
	})
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
	var dbUser models.User
	if strings.Contains(loginReq.NicknameOrEmail, "@") {
		user, err := database.GetUserByEmail(loginReq.NicknameOrEmail)
		if err != nil {
			http.Error(w, "User not found", http.StatusBadRequest)
			return
		}
		dbUser = user.(models.User)
	} else {
		user, err := database.GetUserByNickname(loginReq.NicknameOrEmail)
		if err != nil {
			http.Error(w, "User not found", http.StatusBadRequest)
			return
		}
		dbUser = user.(models.User)
	}

	// Compare the hashed password with the provided password
	err = bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(loginReq.Password))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}
	userId, err := database.GetUserID(dbUser.Nickname)
	if err != nil {
		http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
		return
	}

	// turn dbUser to UserRegisteration
	user := models.UserRegisteration{
		UserId:   userId,
		Nickname: dbUser.Nickname,
		Email:    dbUser.Email,
		Password: dbUser.Password,
		DOB:      dbUser.DOB,
		Gender:   dbUser.Gender,
	}

	// Create a session for the user
	err = CreateSession(w, r, user)
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

	userId, err := database.GetUserID(user.Nickname)
	if err != nil {
		http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"userId":    userId,
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
