#!/bin/bash

# Create new directories
mkdir -p real-time-forum/backend/handlers
mkdir -p real-time-forum/backend/models
mkdir -p real-time-forum/backend/websockets
mkdir -p real-time-forum/backend/utils
mkdir -p real-time-forum/frontend/css
mkdir -p real-time-forum/frontend/js

# Function to move files if they exist
move_file() {
    if [ -f "$1" ]; then
        mv "$1" "$2"
    else
        echo "File $1 does not exist."
    fi
}

# Move existing files to new structure
move_file "server/main.go" "real-time-forum/backend/"
move_file "server/go.mod" "real-time-forum/backend/"
move_file "server/go.sum" "real-time-forum/backend/"

# Move handler files
move_file "server/routes/Auth.go" "real-time-forum/backend/handlers/auth.go"
move_file "server/routes/Posts.go" "real-time-forum/backend/handlers/posts.go"
move_file "server/routes/Comments.go" "real-time-forum/backend/handlers/comments.go"
move_file "server/routes/Activity.go" "real-time-forum/backend/handlers/messages.go"

# Move model files
move_file "server/models/User.go" "real-time-forum/backend/models/user.go"
move_file "server/models/post.go" "real-time-forum/backend/models/post.go"
move_file "server/models/comments.go" "real-time-forum/backend/models/comment.go"
move_file "server/models/notification.go" "real-time-forum/backend/models/message.go"

# Move websocket files (assuming these are part of the routes or helper)
move_file "server/routes/HandleGet.go" "real-time-forum/backend/websockets/hub.go"
move_file "server/routes/session.go" "real-time-forum/backend/websockets/client.go"
move_file "server/routes/notifications.go" "real-time-forum/backend/websockets/message.go"

# Move utility files
move_file "server/helper/ratelimit.go" "real-time-forum/backend/utils/auth.go"
move_file "server/database/Init.go" "real-time-forum/backend/utils/db.go"
move_file "server/database/Verify.go" "real-time-forum/backend/utils/config.go"

# Move frontend files
move_file "client/index.html" "real-time-forum/frontend/"
move_file "client/css/create-post.css" "real-time-forum/frontend/css/"
move_file "client/css/home.css" "real-time-forum/frontend/css/"
move_file "client/css/login.css" "real-time-forum/frontend/css/"
move_file "client/css/nav.css" "real-time-forum/frontend/css/"
move_file "client/css/post-details.css" "real-time-forum/frontend/css/"
move_file "client/css/register.css" "real-time-forum/frontend/css/"
move_file "client/js/Activity.js" "real-time-forum/frontend/js/"
move_file "client/js/CreatePost.js" "real-time-forum/frontend/js/"
move_file "client/js/Index.js" "real-time-forum/frontend/js/"
move_file "client/js/Login.js" "real-time-forum/frontend/js/"
move_file "client/js/nav.js" "real-time-forum/frontend/js/"
move_file "client/js/notifications.js" "real-time-forum/frontend/js/"
move_file "client/js/postDetails.js" "real-time-forum/frontend/js/"
move_file "client/js/Register.js" "real-time-forum/frontend/js/"
move_file "client/js/stats.js" "real-time-forum/frontend/js/"

# Create README.md and .gitignore if they don't exist
touch real-time-forum/README.md
touch real-time-forum/.gitignore

# Clean up any empty directories (if any)
find real-time-forum -type d -empty -delete

echo "Project structure has been reorganized successfully."