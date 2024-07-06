package database

import (
	"fmt"
)

func InsertPostLike(postID int, userID int) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var count int
	err = tx.QueryRow(`SELECT COUNT(*) FROM "like-posts" WHERE postID = ? AND user_id = ?`, postID, userID).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		_, err = tx.Exec(`DELETE FROM "like-posts" WHERE postID = ? AND user_id = ?`, postID, userID)
		if err != nil {
			return err
		}
	} else {
		_, err = tx.Exec(`DELETE FROM "dislike-posts" WHERE postID = ? AND user_id = ?`, postID, userID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(`INSERT INTO "like-posts" (postID, user_id) VALUES (?, ?)`, postID, userID)
		if err != nil {
			return err
		}

		postAuthorID, err := GetPostAuthorID(postID)
		if err != nil {
			return err
		}
		nickname, err := GetUsernameByID(userID)
		if err != nil {
			return err
		}
		message := fmt.Sprintf("Your post was liked by %s", nickname)
		_, err = tx.Exec("INSERT INTO notifications (user_id, message, post_id) VALUES (?, ?, ?)", postAuthorID, message, postID)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func InsertPostDislike(postID int, userID int) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var count int
	err = tx.QueryRow(`SELECT COUNT(*) FROM "dislike-posts" WHERE postID = ? AND user_id = ?`, postID, userID).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		_, err = tx.Exec(`DELETE FROM "dislike-posts" WHERE postID = ? AND user_id = ?`, postID, userID)
		if err != nil {
			return err
		}
	} else {
		_, err = tx.Exec(`DELETE FROM "like-posts" WHERE postID = ? AND user_id = ?`, postID, userID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(`INSERT INTO "dislike-posts" (postID, user_id) VALUES (?, ?)`, postID, userID)
		if err != nil {
			return err
		}

		postAuthorID, err := GetPostAuthorID(postID)
		if err != nil {
			return err
		}
		nickname, err := GetUsernameByID(userID)
		if err != nil {
			return err
		}
		message := fmt.Sprintf("Your post was disliked by %s", nickname)
		_, err = tx.Exec("INSERT INTO notifications (user_id, message, post_id) VALUES (?, ?, ?)", postAuthorID, message, postID)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func InsertCommentLike(commentID, userID int) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var count int
	err = tx.QueryRow(`SELECT COUNT(*) FROM "like-comments" WHERE comment_id = ? AND user_id = ?`, commentID, userID).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		_, err = tx.Exec(`DELETE FROM "like-comments" WHERE comment_id = ? AND user_id = ?`, commentID, userID)
		if err != nil {
			return err
		}
	} else {
		_, err = tx.Exec(`DELETE FROM "dislike-comments" WHERE comment_id = ? AND user_id = ?`, commentID, userID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(`INSERT INTO "like-comments" (comment_id, user_id) VALUES (?, ?)`, commentID, userID)
		if err != nil {
			return err
		}

		commentAuthorID, err := GetCommentAuthorID(commentID)
		if err != nil {
			return err
		}
		nickname, err := GetUsernameByID(userID)
		if err != nil {
			return err
		}

		postID, err := GetPostIDByCommentID(commentID)
		if err != nil {
			return err
		}

		message := fmt.Sprintf("Your comment was liked by %s", nickname)
		_, err = tx.Exec("INSERT INTO notifications (user_id, message, post_id) VALUES (?, ?, ?)", commentAuthorID, message, postID)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func InsertCommentDislike(commentID, userID int) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var count int
	err = tx.QueryRow(`SELECT COUNT(*) FROM "dislike-comments" WHERE comment_id = ? AND user_id = ?`, commentID, userID).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		_, err = tx.Exec(`DELETE FROM "dislike-comments" WHERE comment_id = ? AND user_id = ?`, commentID, userID)
		if err != nil {
			return err
		}
	} else {
		_, err = tx.Exec(`DELETE FROM "like-comments" WHERE comment_id = ? AND user_id = ?`, commentID, userID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(`INSERT INTO "dislike-comments" (comment_id, user_id) VALUES (?, ?)`, commentID, userID)
		if err != nil {
			return err
		}

		commentAuthorID, err := GetCommentAuthorID(commentID)
		if err != nil {
			return err
		}
		nickname, err := GetUsernameByID(userID)
		if err != nil {
			return err
		}
		message := fmt.Sprintf("Your comment was disliked by %s", nickname)
		_, err = tx.Exec("INSERT INTO notifications (user_id, message) VALUES (?, ?)", commentAuthorID, message)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}
