package database

import (
	"fmt"
	"real-time-forum/models"
)

func InsertComment(nickname string, body string, postID int) error {
	userID, err := GetUserID(nickname)
	if err != nil {
		return err
	}

	_, err = DB.Exec(`
        INSERT INTO comments (body, post_id, author)
        VALUES (?, ?, ?)
    `, body, postID, userID)
	if err != nil {
		return err
	}

	postAuthorID, err := GetPostAuthorID(postID)
	if err != nil {
		return err
	}
	message := fmt.Sprintf("%s commented on your post", nickname)
	err = InsertNotification(postAuthorID, message, postID)
	if err != nil {
		return err
	}

	return nil
}

func GetCommentAuthorID(commentID int) (int, error) {
	var authorID int
	err := DB.QueryRow("SELECT author FROM comments WHERE id = ?", commentID).Scan(&authorID)
	return authorID, err
}

func GetPostIDByCommentID(commentID int) (int, error) {
	var postID int
	err := DB.QueryRow("SELECT post_id FROM comments WHERE id = ?", commentID).Scan(&postID)
	return postID, err
}

func DeleteComment(commentID, userID int) error {
	_, err := DB.Exec("DELETE FROM comments WHERE id = ? AND author = ?", commentID, userID)
	return err
}

func UpdateComment(commentID int, nickname, body string) error {
	userID, err := GetUserID(nickname)
	if err != nil {
		return err
	}

	_, err = DB.Exec("UPDATE comments SET body = ? WHERE id = ? AND author = ?", body, commentID, userID)
	return err
}

func GetPostComments(postID, userID int) ([]models.CommentHome, error) {
	rows, err := DB.Query(`
        SELECT 
            comments.id,
            comments.body,
            comments.creation_date,
            users.nickname,
            (SELECT COUNT(*) FROM "like-comments" WHERE "like-comments".comment_id = comments.id) AS likes,
            (SELECT COUNT(*) FROM "dislike-comments" WHERE "dislike-comments".comment_id = comments.id) AS dislikes,
            COALESCE((SELECT 1 FROM "like-comments" WHERE "like-comments".comment_id = comments.id AND user_id = ?), 0) AS user_liked,
            COALESCE((SELECT 1 FROM "dislike-comments" WHERE "dislike-comments".comment_id = comments.id AND user_id = ?), 0) AS user_disliked,
            CASE WHEN comments.author = ? THEN 1 ELSE 0 END AS is_author
        FROM comments
        JOIN users ON comments.author = users.id
        WHERE comments.post_id = ?
        ORDER BY comments.creation_date DESC
    `, userID, userID, userID, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.CommentHome
	for rows.Next() {
		var comment models.CommentHome
		err := rows.Scan(
			&comment.ID,
			&comment.Body,
			&comment.CreationDate,
			&comment.Author,
			&comment.Likes,
			&comment.Dislikes,
			&comment.UserLiked,
			&comment.UserDisliked,
			&comment.IsAuthor,
		)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}
