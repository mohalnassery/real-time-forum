package database

func GetCategoryID(category string) (int, error) {
	var categoryID int
	err := DB.QueryRow("SELECT id FROM categories WHERE name = ?", category).Scan(&categoryID)
	return categoryID, err
}
