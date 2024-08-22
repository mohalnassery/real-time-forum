package main

import (
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"real-time-forum/database"
	"real-time-forum/handlers"
	"real-time-forum/helper"
	"real-time-forum/websockets"
)

func main() {
	// Initialize database tables and defer closing the database connection
	database.InitDatabaseTables()
	defer database.DB.Close()

	// Create a new HTTP serve mux
	r := http.NewServeMux()

	// Create rate limiters for different handlers
	generalLimiter := helper.NewRateLimiter(50, 50) // 50 requests per minute
	authLimiter := helper.NewRateLimiter(10, 10)    // 10 requests per second
	postLimiter := helper.NewRateLimiter(40, 40)    // 40 requests per minute
	commentLimiter := helper.NewRateLimiter(30, 30) // 30 requests per minute

	// Serve the single HTML file for the root and all other frontend routes
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, "../frontend/index.html")
		} else {
			w.Header().Set("X-Custom-Status", "404")
			w.WriteHeader(http.StatusNotFound)
			content, err := ioutil.ReadFile("../frontend/index.html")
			if err != nil {
				http.Error(w, "404 Not Found", http.StatusNotFound)
				return
			}
			w.Write(content)
		}
	})

	// WebSocket endpoint
	hub := websockets.NewHub()
	go hub.Run()
	handlers.InitHub(hub) // Initialize the hub in handlers
	r.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websockets.ServeWs(hub, w, r)
	})

	// Message handling endpoints
	r.Handle("/messages", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetMessagesHandler)))

	// Functionality endpoints
	r.Handle("/categories", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetCategories)))
	r.Handle("/auth/register", helper.LimitMiddleware(authLimiter, http.HandlerFunc(handlers.RegisterHandler)))
	r.Handle("/auth/login", helper.LimitMiddleware(authLimiter, http.HandlerFunc(handlers.LoginHandler)))
	r.Handle("/posts", helper.LimitMiddleware(postLimiter, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handlers.CreatePost(w, r)
		case http.MethodGet:
			handlers.GetPosts(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	r.Handle("/posts/{postId}", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetPost(w, r)
		case http.MethodPut:
			handlers.UpdatePost(w, r)
		case http.MethodDelete:
			handlers.DeletePost(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	// Post-related endpoints
	r.Handle("/posts/{postId}/like", helper.LimitMiddleware(postLimiter, http.HandlerFunc(handlers.LikePost)))
	r.Handle("/posts/{postId}/dislike", helper.LimitMiddleware(postLimiter, http.HandlerFunc(handlers.DislikePost)))
	r.Handle("/posts/{postId}/comments", helper.LimitMiddleware(commentLimiter, http.HandlerFunc(handlers.CreateComment)))

	// Comment-related endpoints
	r.Handle("/comments/{commentId}/like", helper.LimitMiddleware(commentLimiter, http.HandlerFunc(handlers.LikeComment)))
	r.Handle("/comments/{commentId}/dislike", helper.LimitMiddleware(commentLimiter, http.HandlerFunc(handlers.DislikeComment)))
	r.Handle("/comments/{commentId}", helper.LimitMiddleware(commentLimiter, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			handlers.UpdateComment(w, r)
		case http.MethodDelete:
			handlers.DeleteComment(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	// Authentication and user-related endpoints
	r.Handle("/auth/is-logged-in", helper.LimitMiddleware(authLimiter, http.HandlerFunc(handlers.IsLoggedIn)))
	r.Handle("/auth/logout", helper.LimitMiddleware(authLimiter, http.HandlerFunc(handlers.Logout)))
	r.Handle("/user-stats", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetUserStats)))

	// General statistics and leaderboard
	r.Handle("/all-stats", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetAllStats)))
	r.Handle("/leaderboard", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetLeaderboard)))

	// Notification management
	r.Handle("/notifications", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetNotifications)))
	r.Handle("/notifications/clear/{notificationId}", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.ClearNotification)))
	r.Handle("/notifications/mark-all-read", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.MarkAllNotificationsAsRead)))
	r.Handle("/notifications/mark-chat-read/{userId}", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.MarkChatNotificationsAsRead)))

	// New endpoint for fetching users
	r.Handle("/users", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetUsersHandler)))

	// New endpoint for fetching user profile and activity
	r.Handle("/user-profile", helper.LimitMiddleware(generalLimiter, http.HandlerFunc(handlers.GetUserProfile)))

	// Serving static files
	r.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("../frontend/js"))))
	r.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("../frontend/css"))))
	r.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("../frontend/assets"))))
	r.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("../frontend/uploads"))))

	// 404 Not Found handler for API routes
	r.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "404 Not Found", http.StatusNotFound)
	})

	// Parse command-line flags
	flag.Parse()

	// Start the server on port 8080
	server := &http.Server{
		Addr:         ":8080",
		Handler:      r,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Println("Starting server on http://localhost:8080/")
	log.Fatal(server.ListenAndServe())
}
