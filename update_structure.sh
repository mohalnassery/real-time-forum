#!/bin/bash

# Backup and archive the current frontend directory
tar -czvf frontend_backup_$(date +%Y%m%d_%H%M%S).tar.gz frontend

# Create necessary directories
mkdir -p frontend/assets
mkdir -p frontend/css/components
mkdir -p frontend/css/pages
mkdir -p frontend/js/components
mkdir -p frontend/js/pages

# Move files to their new locations
mv frontend/assets/favicon.ico frontend/assets/favicon.ico
mv frontend/assets/logo.png frontend/assets/logo.png

mv frontend/css/auth.css frontend/css/components/auth.css
mv frontend/css/comments.css frontend/css/components/comments.css
mv frontend/css/create-post.css frontend/css/components/create-post.css
mv frontend/css/home.css frontend/css/components/home.css
mv frontend/css/layout.css frontend/css/components/layout.css
mv frontend/css/login.css frontend/css/components/login.css
mv frontend/css/messages.css frontend/css/components/messages.css
mv frontend/css/nav.css frontend/css/components/nav.css
mv frontend/css/post-details.css frontend/css/components/post-details.css
mv frontend/css/posts.css frontend/css/components/posts.css
mv frontend/css/register.css frontend/css/components/register.css
mv frontend/css/styles.css frontend/css/components/styles.css

mv frontend/js/auth/auth.js frontend/js/components/auth.js
mv frontend/js/auth/utils.js frontend/js/components/utils.js
mv frontend/js/comments.js frontend/js/components/comments.js
mv frontend/js/content/Activity.js frontend/js/pages/activity.js
mv frontend/js/content/content.js frontend/js/pages/home.js
mv frontend/js/content/createPost.js frontend/js/pages/createPost.js
mv frontend/js/content/Index.js frontend/js/pages/home.js
mv frontend/js/content/postDetails.js frontend/js/pages/postDetails.js
mv frontend/js/content/posts.js frontend/js/components/posts.js
mv frontend/js/content/stats.js frontend/js/pages/activity.js
mv frontend/js/main.js frontend/js/main.js
mv frontend/js/messages.js frontend/js/components/messages.js
mv frontend/js/nav/nav.js frontend/js/components/nav.js
mv frontend/js/nav/notifications.mjs frontend/js/components/notifications.mjs
mv frontend/js/posts.js frontend/js/components/posts.js
mv frontend/js/websocket.js frontend/js/components/websocket.js

echo "Files have been moved successfully."