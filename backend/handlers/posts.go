package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"real-time-forum/database"
	"real-time-forum/models"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	// Parse the multipart form data
	err := r.ParseMultipartForm(20 << 20) // 20 MB max file size
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the form values for title and body
	title := r.FormValue("title")
	body := r.FormValue("message")

	// Get the form values for categories
	categories := r.Form["options"]

	// Get the user from the session
	user, err := GetSessionUser(r)
	if err != nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}

	// Get the user's ID from the database
	userID, err := database.GetUserID(user.Nickname)
	if err != nil {
		http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
		return
	}

	// Get the image file from the form data
	file, header, err := r.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var imagePath string
	var filename string
	if file != nil {
		// Validate the file type
		allowedTypes := map[string]bool{
			"image/jpeg": true,
			"image/png":  true,
			"image/gif":  true,
		}
		if !allowedTypes[header.Header.Get("Content-Type")] {
			http.Error(w, "Invalid file type. Only JPEG, PNG, and GIF are allowed.", http.StatusBadRequest)
			return
		}

		// Generate a unique filename for the uploaded image
		ext := filepath.Ext(header.Filename)
		filename = fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		imagePath = filepath.Join("../frontend/uploads", filename)

		// Save the uploaded image file
		dst, err := os.Create(imagePath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		_, err = io.Copy(dst, file)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Create a new post object with the form data and user ID
	post := &models.Post{
		Title:        title,
		Body:         body,
		CreationDate: time.Now().Format(time.RFC3339),
		AuthorID:     userID,
		Categories:   categories,
		Image:        filename,
	}

	err = database.InsertPost(post)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Redirect to the main page after successfully creating a post
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func GetPosts(w http.ResponseWriter, r *http.Request) {
	// Main selection
	query := `
        SELECT
            posts.post_id,
            posts.title,
            posts.body,
            posts.creation_date,
            users.nickname,
            GROUP_CONCAT(DISTINCT categories.name) AS categories,
            (SELECT COUNT(*) FROM "like-posts" WHERE "like-posts".postID = posts.post_id) AS likes,
            (SELECT COUNT(*) FROM "dislike-posts" WHERE "dislike-posts".postID = posts.post_id) AS dislikes,
            (SELECT COUNT(*) FROM comments WHERE post_id = posts.post_id) AS comment_count
        FROM posts
        JOIN users ON posts.author = users.id
        LEFT JOIN post_categories ON posts.post_id = post_categories.post_id
        LEFT JOIN categories ON post_categories.category_id = categories.id
    `

	var params []interface{}
	var whereClause []string

	// Filters
	fullQuery := r.URL.Query()
	if len(fullQuery) > 0 {
		// Get potential filter options
		categoryQuery := fullQuery["category"]
		filterLikes := fullQuery["liked"]
		filterCreated := fullQuery["created"]

		if len(categoryQuery) > 0 {
			categoryNames := strings.Split(categoryQuery[0], ",")
			placeholders := make([]string, len(categoryNames))
			for i := range categoryNames {
				placeholders[i] = "?"
				params = append(params, categoryNames[i])
			}
			whereClause = append(whereClause, "posts.post_id IN (SELECT post_id FROM post_categories WHERE category_id IN (SELECT id FROM categories WHERE name IN ("+strings.Join(placeholders, ",")+")))")
		}
		if len(filterCreated) > 0 {
			whereClause = append(whereClause, "users.nickname = ?")
			params = append(params, filterCreated[0])
		}
		if len(filterLikes) > 0 {
			whereClause = append(whereClause, "posts.post_id IN (SELECT postID FROM 'like-posts' WHERE user_id IN (SELECT id FROM users WHERE nickname = ?))")
			params = append(params, filterLikes[0])
		}
	}

	if len(whereClause) > 0 {
		query += " WHERE " + strings.Join(whereClause, " AND ")
	}

	// Sorting
	query += `
		GROUP BY posts.post_id
		ORDER BY posts.creation_date DESC;
	`

	// Execution
	rows, err := database.DB.Query(query, params...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []models.PostHome
	for rows.Next() {
		var post models.PostHome
		var categoriesString sql.NullString
		if err := rows.Scan(&post.PostID, &post.Title, &post.Body, &post.CreationDate, &post.Author, &categoriesString, &post.Likes, &post.Dislikes, &post.CommentCount); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if categoriesString.Valid {
			post.Categories = strings.Split(categoriesString.String, ",")
		} else {
			post.Categories = []string{}
		}
		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// setting the heading in the front-end to be of type application json
	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(posts); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetPost(w http.ResponseWriter, r *http.Request) {
	urlParts := strings.Split(r.URL.Path, "/")
	if len(urlParts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(urlParts[2])
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	// Get the user from the session
	user, err := GetSessionUser(r)
	var userID int
	if err != nil {
		// User is not logged in, set userID to 0
		userID = 0
	} else {
		// Get the user's ID from the database
		userID, err = database.GetUserID(user.Nickname)
		if err != nil {
			http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
			return
		}
	}

	// Retrieve the post details from the database
	post, err := database.GetPostDetails(postID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Retrieve the comments for the post
	comments, err := database.GetPostComments(postID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Prepare the response
	response := struct {
		Post     models.PostHome      `json:"post"`
		Comments []models.CommentHome `json:"comments"`
	}{
		Post:     post,
		Comments: comments,
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func DeletePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	urlParts := strings.Split(r.URL.Path, "/")
	if len(urlParts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	postID, err := strconv.Atoi(urlParts[2])
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	user, err := GetSessionUser(r)
	if err != nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}

	userID, err := database.GetUserID(user.Nickname)
	if err != nil {
		http.Error(w, "Failed to retrieve user ID", http.StatusInternalServerError)
		return
	}

	err = database.DeletePost(postID, userID)
	if err != nil {
		http.Error(w, "Failed to delete post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

}

func UpdatePost(w http.ResponseWriter, r *http.Request) {
	// Extract postID from URL
	postID, err := strconv.Atoi(strings.TrimPrefix(r.URL.Path, "/posts/"))
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	// Get the user from the session
	user, err := GetSessionUser(r)
	if err != nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}

	// Parse the request body
	var updateRequest struct {
		Title string `json:"title"`
		Body  string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the post in the database
	err = database.UpdatePost(postID, user.Nickname, updateRequest.Title, updateRequest.Body)
	if err != nil {
		http.Error(w, "Failed to update post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
