package database

import (
	"database/sql"
	"os"
	"path/filepath"
	"real-time-forum/models"
	"strings"
)

func InsertPost(post *models.Post) error {
	result, err := DB.Exec("INSERT INTO posts (title, body, image, creation_date, author) VALUES (?, ?, ?, ?, ?)",
		post.Title, post.Body, post.Image, post.CreationDate, post.AuthorID)
	if err != nil {
		return err
	}

	postID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	post.PostID = int(postID)

	for _, category := range post.Categories {
		categoryID, err := GetCategoryID(category)
		if err != nil {
			return err
		}

		_, err = DB.Exec("INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)", post.PostID, categoryID)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetPostAuthorID(postID int) (int, error) {
	var authorID int
	err := DB.QueryRow("SELECT author FROM posts WHERE post_id = ?", postID).Scan(&authorID)
	return authorID, err
}

func GetPostDetails(postID, userID int) (models.PostHome, error) {
	var post models.PostHome
	var categoriesString sql.NullString
	err := DB.QueryRow(`
        SELECT 
            posts.post_id, 
            posts.title, 
            posts.body, 
            posts.creation_date,
            posts.image,
            users.username,
            GROUP_CONCAT(DISTINCT categories.name) AS categories,
            (SELECT COUNT(*) FROM "like-posts" WHERE "like-posts".postID = posts.post_id) AS likes,
            (SELECT COUNT(*) FROM "dislike-posts" WHERE "dislike-posts".postID = posts.post_id) AS dislikes,
            (SELECT COUNT(*) FROM comments WHERE post_id = posts.post_id) AS comment_count,
            COALESCE((SELECT 1 FROM "like-posts" WHERE "like-posts".postID = posts.post_id AND user_id = ?), 0) AS user_liked,
            COALESCE((SELECT 1 FROM "dislike-posts" WHERE "dislike-posts".postID = posts.post_id AND user_id = ?), 0) AS user_disliked,
            CASE WHEN posts.author = ? THEN 1 ELSE 0 END AS is_author
        FROM posts
        JOIN users ON posts.author = users.id
        LEFT JOIN post_categories ON posts.post_id = post_categories.post_id
        LEFT JOIN categories ON post_categories.category_id = categories.id
        WHERE posts.post_id = ?
        GROUP BY posts.post_id
    `, userID, userID, userID, postID).Scan(
		&post.PostID,
		&post.Title,
		&post.Body,
		&post.CreationDate,
		&post.Image,
		&post.Author,
		&categoriesString,
		&post.Likes,
		&post.Dislikes,
		&post.CommentCount,
		&post.UserLiked,
		&post.UserDisliked,
		&post.IsAuthor,
	)
	if err != nil {
		return post, err
	}

	if categoriesString.Valid {
		post.Categories = strings.Split(categoriesString.String, ",")
	} else {
		post.Categories = []string{}
	}

	return post, nil
}

func DeletePost(postID, userID int) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Retrieve the image file path from the posts table
	var imagePath string
	err = tx.QueryRow("SELECT image FROM posts WHERE post_id = ? AND author = ?", postID, userID).Scan(&imagePath)
	if err != nil {
		return err
	}
	_, err = tx.Exec("DELETE FROM posts WHERE post_id = ? AND author = ?", postID, userID)
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM `like-posts` WHERE postID = ?", postID)
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM `dislike-posts` WHERE postID = ?", postID)
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM comments WHERE post_id = ?", postID)
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM post_categories WHERE post_id = ?", postID)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	// Delete the image file from the server
	if imagePath != "" {
		err = os.Remove(filepath.Join("../client/uploads", imagePath))
		if err != nil {
			return err
		}
	}

	return nil
}

func UpdatePost(postID int, username string, title string, body string) error {
	_, err := DB.Exec("UPDATE posts SET title = ?, body = ? WHERE post_id = ? AND author = (SELECT id FROM users WHERE username = ?)", title, body, postID, username)
	return err
}
