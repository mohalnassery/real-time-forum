#!/bin/bash

# Create necessary directories
mkdir -p backend/handlers
mkdir -p backend/models
mkdir -p backend/database
mkdir -p backend/websockets
mkdir -p backend/utils
mkdir -p frontend/css
mkdir -p frontend/js

# Move existing files to their new locations
mv backend/main.go backend/
mv backend/go.mod backend/
mv backend/go.sum backend/
mv backend/handlers/auth.go backend/handlers/auth.go
mv backend/handlers/posts.go backend/handlers/posts.go
mv backend/handlers/comments.go backend/handlers/comments.go
mv backend/handlers/messages.go backend/handlers/messages.go
mv backend/models/user.go backend/models/user.go
mv backend/models/post.go backend/models/post.go
mv backend/models/comment.go backend/models/comment.go
mv backend/models/message.go backend/models/message.go
mv frontend/index.html frontend/index.html

# Move files from oldStructure if they exist
mv oldStructure/server/routes/Likes.go backend/handlers/likes.go
mv oldStructure/server/models/Like.go backend/models/like.go
mv oldStructure/server/database/Insert.go backend/database/db_user.go
mv oldStructure/server/database/Insert.go backend/database/db_post.go
mv oldStructure/server/database/Insert.go backend/database/db_comment.go
mv oldStructure/server/database/Insert.go backend/database/db_notification.go
mv oldStructure/server/database/Insert.go backend/database/db_like.go
mv oldStructure/server/websockets/hub.go backend/websockets/hub.go
mv oldStructure/server/websockets/client.go backend/websockets/client.go
mv oldStructure/server/websockets/message.go backend/websockets/message.go
mv oldStructure/server/utils/auth.go backend/utils/auth.go
mv oldStructure/server/utils/db.go backend/utils/db.go
mv oldStructure/server/utils/config.go backend/utils/config.go

# Create new files if they don't exist
touch backend/handlers/likes.go
touch backend/models/like.go
touch backend/database/db_user.go
touch backend/database/db_post.go
touch backend/database/db_comment.go
touch backend/database/db_notification.go
touch backend/database/db_like.go
touch backend/websockets/hub.go
touch backend/websockets/client.go
touch backend/websockets/message.go
touch backend/utils/auth.go
touch backend/utils/db.go
touch backend/utils/config.go
touch backend/main_test.go
touch frontend/index.html
touch frontend/css/styles.css
touch frontend/css/layout.css
touch frontend/css/auth.css
touch frontend/css/posts.css
touch frontend/css/comments.css
touch frontend/css/messages.css
touch frontend/js/app.js
touch frontend/js/auth.js
touch frontend/js/posts.js
touch frontend/js/comments.js
touch frontend/js/messages.js
touch frontend/js/websocket.js
touch README.md
touch .gitignore

echo "Project structure has been set up successfully."