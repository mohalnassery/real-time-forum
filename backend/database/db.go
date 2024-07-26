package database

import (
	"database/sql"
	"fmt"
	"real-time-forum/models"

	_ "github.com/mattn/go-sqlite3" // Import the SQLite3 driver
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB // this will store the init session instead of calling the function everytime

func InitConnection() (*sql.DB, error) {
	// Use SQLCipher for SQLite encryption
	db, err := sql.Open("sqlite3", "file:form.db?cipher=sqlcipher&key=your_password")
	if err != nil {
		return nil, err
	}

	// Enable the foreign key constraints
	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return nil, err
	}

	return db, nil
}

func InitDatabaseTables() {
	var err error
	DB, err = InitConnection()
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	// will create tables if they don't exist
	if err = CreateAllTables(DB); err != nil {
		fmt.Println(err.Error())
		return
	}

	// will seed categories if they don't exist
	if err = SeedCategories(DB); err != nil {
		fmt.Println(err.Error())
		return
	}

	// Check if fake data has already been seeded
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	if count == 0 {
		// Seed fake data only if no users exist
		if err = SeedFakeData(DB); err != nil {
			fmt.Println(err.Error())
			return
		}
	}
}

func CreateAllTables(db *sql.DB) error {
	sqlTable := `
		CREATE TABLE IF NOT EXISTS posts (
			post_id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			body TEXT NOT NULL,
			image TEXT,
			creation_date DATE NOT NULL,
			author INTEGER,
			FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
		);

	
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nickname TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL,
			password TEXT,
			auth_type TEXT NOT NULL,
			dob DATE,
			gender TEXT,
			first_name TEXT,
			last_name TEXT
		);
		

		CREATE TABLE IF NOT EXISTS "like-posts" (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			postID INTEGER,
			user_id INTEGER,
			liked BOOLEAN,
			FOREIGN KEY (postID) REFERENCES posts(post_id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (postID, user_id)
		);

		CREATE TABLE IF NOT EXISTS "dislike-posts" (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			postID INTEGER,
			user_id INTEGER,
			liked BOOLEAN,
			FOREIGN KEY (postID) REFERENCES posts(post_id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (postID, user_id)
		);

		CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			body TEXT NOT NULL,
			post_id INTEGER,
			author INTEGER,
			creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
			FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS "like-comments" (
			id INTEGER PRIMARY KEY,
			comment_id INTEGER,
			user_id INTEGER,
			FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (comment_id, user_id)
		);
		
		CREATE TABLE IF NOT EXISTS "dislike-comments" (
			id INTEGER PRIMARY KEY,
			comment_id INTEGER,
			user_id INTEGER,
			FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (comment_id, user_id)
		);
		
		CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE
		);
		
		CREATE TABLE IF NOT EXISTS post_categories (
			post_id INTEGER,
			category_id INTEGER,
			PRIMARY KEY (post_id, category_id),
			FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
			FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
		);
		CREATE TABLE IF NOT EXISTS sessions (
			session_id TEXT PRIMARY KEY,
			nickname TEXT,
			expires_at DATETIME,
			FOREIGN KEY (nickname) REFERENCES users(nickname) ON DELETE CASCADE
		);
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			post_id INTEGER,
            is_read BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
        );
		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER,
			receiver_id INTEGER,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
		);
	`
	_, err := db.Exec(sqlTable)
	if err != nil {
		return err
	}
	return nil
}

func SeedCategories(db *sql.DB) error {
	categories := []string{"Programming", "Engineering", "Medicine", "Music", "Drama"}

	for _, category := range categories {
		_, err := db.Exec("INSERT INTO categories (name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = ?)", category, category)
		if err != nil {
			return err
		}
	}

	return nil
}

func SeedFakeData(db *sql.DB) error {
	// Create sample users
	users := []models.UserRegisteration{
		{Nickname: "johndoe", Email: "johndoe@example.com", Password: "johndoe", AuthType: "local", DOB: "1990-01-01", Gender: "Male", FirstName: "John", LastName: "Doe"},
		{Nickname: "janedoe", Email: "janedoe@example.com", Password: "janedoe", AuthType: "local", DOB: "1992-02-02", Gender: "Female", FirstName: "Jane", LastName: "Doe"},
		{Nickname: "bobsmith", Email: "bobsmith@example.com", Password: "bobsmith", AuthType: "local", DOB: "1988-03-03", Gender: "Male", FirstName: "Bob", LastName: "Smith"},
		{Nickname: "alicejones", Email: "alicejones@example.com", Password: "alicejones", AuthType: "local", DOB: "1995-04-04", Gender: "Female", FirstName: "Alice", LastName: "Jones"},
		{Nickname: "mikebrown", Email: "mikebrown@example.com", Password: "mikebrown", AuthType: "local", DOB: "1985-05-05", Gender: "Male", FirstName: "Mike", LastName: "Brown"},
		{Nickname: "example1234", Email: "example1234@example.com", Password: "example1234", AuthType: "local", DOB: "1990-06-06", Gender: "Male", FirstName: "Example", LastName: "1234"},
	}

	for _, user := range users {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		_, err = db.Exec("INSERT INTO users (nickname, email, password, auth_type, dob, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", user.Nickname, user.Email, string(hashedPassword), user.AuthType, user.DOB, user.Gender, user.FirstName, user.LastName)
		if err != nil {
			return err
		}
	}

	// Create sample posts
	posts := []struct {
		Title    string
		Body     string
		Author   string
		Category string
	}{
		{Title: "Introduction to Golang", Body: "Golang is a powerful programming language...", Author: "johndoe", Category: "Programming"},
		{Title: "Basics of Electrical Engineering", Body: "Electrical engineering is a fascinating field...", Author: "janedoe", Category: "Engineering"},
		{Title: "Advances in Medical Research", Body: "Recent medical research has shown promising results...", Author: "bobsmith", Category: "Medicine"},
		{Title: "The Art of Playing Guitar", Body: "Playing guitar is a rewarding experience...", Author: "alicejones", Category: "Music"},
		{Title: "Acting Techniques for Beginners", Body: "If you're new to acting, here are some techniques...", Author: "mikebrown", Category: "Drama"},
		{Title: "Data Structures and Algorithms", Body: "Understanding data structures and algorithms is crucial...", Author: "johndoe", Category: "Programming"},
		{Title: "Renewable Energy Sources", Body: "Renewable energy sources are becoming increasingly important...", Author: "janedoe", Category: "Engineering"},
		{Title: "Breakthroughs in Cancer Treatment", Body: "New cancer treatments have shown remarkable success...", Author: "bobsmith", Category: "Medicine"},
		{Title: "Composing Music for Films", Body: "Composing music for films requires a unique set of skills...", Author: "alicejones", Category: "Music"},
		{Title: "Directing a Play: Tips and Tricks", Body: "Directing a play can be a challenging but rewarding experience...", Author: "mikebrown", Category: "Drama"},
	}

	for _, post := range posts {
		var authorID int
		err := db.QueryRow("SELECT id FROM users WHERE nickname = ?", post.Author).Scan(&authorID)
		if err != nil {
			return err
		}
		result, err := db.Exec("INSERT INTO posts (title, body, creation_date, author) VALUES (?, ?, DATE('now'), ?)", post.Title, post.Body, authorID)
		if err != nil {
			return err
		}
		postID, _ := result.LastInsertId()

		var categoryID int
		err = db.QueryRow("SELECT id FROM categories WHERE name = ?", post.Category).Scan(&categoryID)
		if err != nil {
			return err
		}
		_, err = db.Exec("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)", postID, categoryID)
		if err != nil {
			return err
		}
	}

	// Create sample comments
	comments := []struct {
		Body   string
		PostID int
		Author string
	}{
		{Body: "Great article! I learned a lot.", PostID: 1, Author: "janedoe"},
		{Body: "Thanks for sharing your insights.", PostID: 1, Author: "bobsmith"},
		{Body: "I have a question regarding this topic.", PostID: 2, Author: "alicejones"},
		{Body: "Well written and informative.", PostID: 2, Author: "mikebrown"},
		{Body: "I disagree with some of the points made.", PostID: 3, Author: "johndoe"},
		{Body: "This post helped me understand the concept better.", PostID: 3, Author: "janedoe"},
		{Body: "I would like to see more examples.", PostID: 4, Author: "bobsmith"},
		{Body: "Thanks for the helpful tips!", PostID: 4, Author: "alicejones"},
		{Body: "I have a similar experience to share.", PostID: 5, Author: "mikebrown"},
		{Body: "I found this post very inspiring.", PostID: 5, Author: "johndoe"},
		{Body: "I'm looking forward to more posts on this topic.", PostID: 6, Author: "janedoe"},
		{Body: "I have a suggestion for a future post.", PostID: 6, Author: "bobsmith"},
		{Body: "I tried the techniques mentioned and they worked well.", PostID: 7, Author: "alicejones"},
		{Body: "I have a different perspective on this matter.", PostID: 7, Author: "mikebrown"},
		{Body: "This post answered many of my questions.", PostID: 8, Author: "johndoe"},
		{Body: "I appreciate the depth of information provided.", PostID: 8, Author: "janedoe"},
		{Body: "I'm curious to learn more about this subject.", PostID: 9, Author: "bobsmith"},
		{Body: "I found the examples very helpful.", PostID: 9, Author: "alicejones"},
		{Body: "I have a related story to share.", PostID: 10, Author: "mikebrown"},
		{Body: "I'm impressed by the quality of this post.", PostID: 10, Author: "johndoe"},
	}

	for _, comment := range comments {
		var authorID int
		err := db.QueryRow("SELECT id FROM users WHERE nickname = ?", comment.Author).Scan(&authorID)
		if err != nil {
			return err
		}
		_, err = db.Exec("INSERT INTO comments (body, post_id, author) VALUES (?, ?, ?)", comment.Body, comment.PostID, authorID)
		if err != nil {
			return err
		}
	}

	// Create sample likes and dislikes for posts
	postActions := []struct {
		PostID int
		User   string
		Action string
	}{
		{PostID: 1, User: "johndoe", Action: "like"},
		{PostID: 1, User: "janedoe", Action: "like"},
		{PostID: 2, User: "bobsmith", Action: "dislike"},
		{PostID: 2, User: "alicejones", Action: "like"},
		{PostID: 3, User: "mikebrown", Action: "like"},
		{PostID: 3, User: "johndoe", Action: "dislike"},
		{PostID: 4, User: "janedoe", Action: "like"},
		{PostID: 4, User: "bobsmith", Action: "like"},
		{PostID: 5, User: "alicejones", Action: "dislike"},
		{PostID: 5, User: "mikebrown", Action: "like"},
	}

	for _, action := range postActions {
		var userID int
		err := db.QueryRow("SELECT id FROM users WHERE nickname = ?", action.User).Scan(&userID)
		if err != nil {
			return err
		}

		// Check if the user has already liked or disliked the post
		var count int
		err = db.QueryRow(`SELECT COUNT(*) FROM "like-posts" WHERE postID = ? AND user_id = ?`, action.PostID, userID).Scan(&count)
		if err != nil {
			return err
		}

		if count == 0 {
			err = db.QueryRow(`SELECT COUNT(*) FROM "dislike-posts" WHERE postID = ? AND user_id = ?`, action.PostID, userID).Scan(&count)
			if err != nil {
				return err
			}
		}

		if count == 0 {
			if action.Action == "like" {
				_, err = db.Exec(`INSERT INTO "like-posts" (postID, user_id) VALUES (?, ?)`, action.PostID, userID)
			} else {
				_, err = db.Exec(`INSERT INTO "dislike-posts" (postID, user_id) VALUES (?, ?)`, action.PostID, userID)
			}
			if err != nil {
				return err
			}
		}
	}

	return nil
}
