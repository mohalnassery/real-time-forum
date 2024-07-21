package database

import (
	"database/sql"
	"real-time-forum/models"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func InsertUser(user *models.UserRegisteration) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	if err != nil {
		return err
	}
	hashedPassword := string(bytes)

	_, err = DB.Exec("INSERT INTO users (nickname, email, password, auth_type) VALUES (?, ?, ?, ?)", user.Nickname, user.Email, hashedPassword, user.AuthType)
	if err != nil {
		return err
	}

	return nil
}

func IsUserTaken(user *models.UserRegisteration) (string, error) {
	var countUser int
	var countEmail int
	err := DB.QueryRow(` SELECT  (SELECT COUNT(*) FROM users WHERE nickname = ?) AS countUsers, 
	(SELECT COUNT(*) FROM users WHERE email = ?) AS countEmail`, user.Nickname, user.Email).Scan(&countUser, &countEmail)
	if err != nil {
		return "", err
	}
	if countUser > 0 {
		return "Nickname already taken", nil
	}
	if countEmail > 0 {
		return "Email already taken", nil
	}
	return "", nil
}

func IsValidLogin(user *models.UserLogin) (bool, error) {
	var nickname, password string

	user.Nickname = strings.ToLower(user.Nickname)

	err := DB.QueryRow("SELECT nickname, password FROM users WHERE nickname = ?", user.Nickname).Scan(&nickname, &password)
	if err == sql.ErrNoRows {
		return false, nil
	} else if err != nil {
		return false, err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(password), []byte(user.Password)); err != nil {
		return false, nil
	}

	return true, nil
}

func GetUserID(nickname string) (int, error) {
	var userID int
	err := DB.QueryRow("SELECT id FROM users WHERE nickname = ?", nickname).Scan(&userID)
	return userID, err
}

func GetUsernameByID(userID int) (string, error) {
	var nickname string
	err := DB.QueryRow("SELECT nickname FROM users WHERE id = ?", userID).Scan(&nickname)
	return nickname, err
}

func CreateUser(db *sql.DB, user models.UserRegisteration) error {
	_, err := db.Exec("INSERT INTO users (nickname, email, password, auth_type, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", user.Nickname, user.Email, user.Password, user.AuthType, user.Age, user.Gender, user.FirstName, user.LastName)
	return err
}

func GetUserByEmail(db *sql.DB, email string) (interface{}, error) {
	var user models.User
	err := db.QueryRow("SELECT id, nickname, email, password, auth_type FROM users WHERE email = ?", email).Scan(&user.ID, &user.Nickname, &user.Email, &user.Password, &user.AuthType)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByNickname(db *sql.DB, nickname string) (interface{}, error) {
	var user models.User
	err := db.QueryRow("SELECT id, nickname, email, password, auth_type FROM users WHERE nickname = ?", nickname).Scan(&user.ID, &user.Nickname, &user.Email, &user.Password, &user.AuthType)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUsers() ([]models.User, error) {
	rows, err := DB.Query("SELECT id, nickname FROM users ORDER BY nickname")
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

func GetUserProfile(userID int) (models.User, error) {
	var user models.User
	err := DB.QueryRow("SELECT first_name, last_name, age, nickname, gender FROM users WHERE id = ?", userID).Scan(&user.FirstName, &user.LastName, &user.Age, &user.Nickname, &user.Gender)
	return user, err
}
