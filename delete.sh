#!/bin/bash

# Function to delete files if they exist
delete_file() {
    if [ -f "$1" ]; then
        rm "$1"
        echo "Deleted $1"
    else
        echo "File $1 does not exist."
    fi
}

# Delete existing files
delete_file "oldStructure/server/main.go"
delete_file "oldStructure/server/go.mod"
delete_file "oldStructure/server/go.sum"

# Delete handler files
delete_file "oldStructure/server/routes/Auth.go"
delete_file "oldStructure/server/routes/Posts.go"
delete_file "oldStructure/server/routes/Comments.go"
delete_file "oldStructure/server/routes/Activity.go"

# Delete model files
delete_file "oldStructure/server/models/User.go"
delete_file "oldStructure/server/models/post.go"
delete_file "oldStructure/server/models/comments.go"
delete_file "oldStructure/server/models/notification.go"

# Delete websocket files
delete_file "oldStructure/server/routes/HandleGet.go"
delete_file "oldStructure/server/routes/session.go"
delete_file "oldStructure/server/routes/notifications.go"

# Delete utility files
delete_file "oldStructure/server/helper/ratelimit.go"
delete_file "oldStructure/server/database/Init.go"
delete_file "oldStructure/server/database/Verify.go"

# Delete frontend files
delete_file "oldStructure/client/index.html"
delete_file "oldStructure/client/css/create-post.css"
delete_file "oldStructure/client/css/home.css"
delete_file "oldStructure/client/css/login.css"
delete_file "oldStructure/client/css/nav.css"
delete_file "oldStructure/client/css/post-details.css"
delete_file "oldStructure/client/css/register.css"
delete_file "oldStructure/client/js/Activity.js"
delete_file "oldStructure/client/js/CreatePost.js"
delete_file "oldStructure/client/js/Index.js"
delete_file "oldStructure/client/js/Login.js"
delete_file "oldStructure/client/js/nav.js"
delete_file "oldStructure/client/js/notifications.js"
delete_file "oldStructure/client/js/postDetails.js"
delete_file "oldStructure/client/js/Register.js"
delete_file "oldStructure/client/js/stats.js"

echo "Files have been deleted successfully."