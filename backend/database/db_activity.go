package database

import (
	"database/sql"
	"real-time-forum/models"
)

func GetUserActivity(userID int) (models.UserActivity, error) {
	var activity models.UserActivity

	// Retrieve user-created posts
	rows, err := DB.Query("SELECT post_id, title, body, creation_date FROM posts WHERE author = ?", userID)
	if err != nil {
		return activity, err
	}
	defer rows.Close()

	for rows.Next() {
		var post models.Post
		err := rows.Scan(&post.PostID, &post.Title, &post.Body, &post.CreationDate)
		if err != nil {
			return activity, err
		}
		activity.CreatedPosts = append(activity.CreatedPosts, post)
	}

	// Retrieve posts where the user left a like or dislike
	rows, err = DB.Query(`
		SELECT p.post_id, p.title, p.body, p.creation_date, l.liked
		FROM posts p
		JOIN "like-posts" l ON p.post_id = l.postID
		WHERE l.user_id = ?`, userID)
	if err != nil {
		return activity, err
	}
	defer rows.Close()

	for rows.Next() {
		var post models.Post
		var liked sql.NullBool
		err := rows.Scan(&post.PostID, &post.Title, &post.Body, &post.CreationDate, &liked)
		if err != nil {
			return activity, err
		}
		if liked.Valid && liked.Bool {
			activity.LikedPosts = append(activity.LikedPosts, post)
		} else if liked.Valid && !liked.Bool {
			activity.DislikedPosts = append(activity.DislikedPosts, post)
		}
	}

	// Retrieve comments made by the user, along with the corresponding post information
	rows, err = DB.Query(`
		SELECT c.id, c.body, c.creation_date, p.post_id, p.title, p.body, p.creation_date
		FROM comments c
		JOIN posts p ON c.post_id = p.post_id
		WHERE c.author = ?`, userID)
	if err != nil {
		return activity, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment models.CommentHome
		var post models.Post
		err := rows.Scan(&comment.ID, &comment.Body, &comment.CreationDate, &post.PostID, &post.Title, &post.Body, &post.CreationDate)
		if err != nil {
			return activity, err
		}
		comment.PostID = post.PostID
		comment.Post = post // Ensure the Post field is populated
		activity.Comments = append(activity.Comments, comment)
	}

	// Retrieve comments liked by the user
	rows, err = DB.Query(`
		SELECT c.id, c.body, c.creation_date, p.post_id, p.title, p.body, p.creation_date
		FROM comments c
		JOIN posts p ON c.post_id = p.post_id
		JOIN "like-comments" lc ON c.id = lc.comment_id
		WHERE lc.user_id = ?`, userID)
	if err != nil {
		return activity, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment models.CommentHome
		var post models.Post
		err := rows.Scan(&comment.ID, &comment.Body, &comment.CreationDate, &post.PostID, &post.Title, &post.Body, &post.CreationDate)
		if err != nil {
			return activity, err
		}
		comment.PostID = post.PostID
		comment.Post = post // Ensure the Post field is populated
		activity.LikedComments = append(activity.LikedComments, comment)
	}

	// Retrieve comments disliked by the user
	rows, err = DB.Query(`
		SELECT c.id, c.body, c.creation_date, p.post_id, p.title, p.body, p.creation_date
		FROM comments c
		JOIN posts p ON c.post_id = p.post_id
		JOIN "dislike-comments" dc ON c.id = dc.comment_id
		WHERE dc.user_id = ?`, userID)
	if err != nil {
		return activity, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment models.CommentHome
		var post models.Post
		err := rows.Scan(&comment.ID, &comment.Body, &comment.CreationDate, &post.PostID, &post.Title, &post.Body, &post.CreationDate)
		if err != nil {
			return activity, err
		}
		comment.PostID = post.PostID
		comment.Post = post // Ensure the Post field is populated
		activity.DislikedComments = append(activity.DislikedComments, comment)
	}

	return activity, nil
}
