package models

type UserStats struct {
	Posts    int `json:"posts"`
	Comments int `json:"comments"`
	Likes    int `json:"likes"`
	Dislikes int `json:"dislikes"`
}

type AllStats struct {
	TotalPosts    int `json:"totalPosts"`
	TotalComments int `json:"totalComments"`
	TotalLikes    int `json:"totalLikes"`
	TotalDislikes int `json:"totalDislikes"`
}

type LeaderboardEntry struct {
	Nickname  string `json:"nickname"`
	PostCount int    `json:"postCount"`
}
