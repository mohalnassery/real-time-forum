package models

type UserRegisteration struct {
	UserId    int    `json:"userId"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	AuthType  string `json:"auth_type"`
	DOB       string `json:"dob"` // Change age to dob
	Gender    string `json:"gender"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type UserLogin struct {
	Nickname string `json:"nickname"`
	Password string `json:"password"`
}

type UserActivity struct {
	CreatedPosts     []Post        `json:"createdPosts"`
	LikedPosts       []Post        `json:"likedPosts"`
	DislikedPosts    []Post        `json:"dislikedPosts"`
	Comments         []CommentHome `json:"comments"`
	LikedComments    []CommentHome `json:"likedComments"`
	DislikedComments []CommentHome `json:"dislikedComments"`
}

// User represents a user in the system
type User struct {
	ID        int    `json:"id"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	AuthType  string `json:"auth_type"`
	DOB       string `json:"dob"` // Change age to dob
	Gender    string `json:"gender"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Age       int    `json:"age"` // Add age field for profile display
}
