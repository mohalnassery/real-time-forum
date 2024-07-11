# Task 1: Set up the project structure
- Files: `folders-files-restructure.sh`

- [X] Create the necessary directories for the new project structure.
    - [X] Create `real-time-forum/backend/handlers`
    - [X] Create `real-time-forum/backend/models`
    - [X] Create `real-time-forum/backend/websockets`
    - [X] Create `real-time-forum/backend/utils`
    - [X] Create `real-time-forum/frontend/css`
    - [X] Create `real-time-forum/frontend/js`
- [X] Move existing files to their new locations.
    - [X] Move `server/main.go` to `real-time-forum/backend/`
    - [X] Move `server/go.mod` to `real-time-forum/backend/`
    - [X] Move `server/go.sum` to `real-time-forum/backend/`
    - [X] Move `server/routes/Auth.go` to `real-time-forum/backend/handlers/auth.go`
    - [X] Move `server/routes/Posts.go` to `real-time-forum/backend/handlers/posts.go`
    - [X] Move `server/routes/Comments.go` to `real-time-forum/backend/handlers/comments.go`
    - [X] Move `server/routes/Activity.go` to `real-time-forum/backend/handlers/messages.go`
    - [X] Move `server/models/User.go` to `real-time-forum/backend/models/user.go`
    - [X] Move `server/models/post.go` to `real-time-forum/backend/models/post.go`
    - [X] Move `server/models/comments.go` to `real-time-forum/backend/models/comment.go`
    - [X] Move `server/models/notification.go` to `real-time-forum/backend/models/message.go`
    - [X] Move `server/routes/HandleGet.go` to `real-time-forum/backend/websockets/hub.go`
    - [X] Move `server/routes/session.go` to `real-time-forum/backend/websockets/client.go`
    - [X] Move `server/routes/notifications.go` to `real-time-forum/backend/websockets/message.go`
    - [X] Move `server/helper/ratelimit.go` to `real-time-forum/backend/utils/auth.go`
    - [X] Move `server/database/Init.go` to `real-time-forum/backend/utils/db.go`
    - [X] Move `server/database/Verify.go` to `real-time-forum/backend/utils/config.go`
    - [X] Move `client/index.html` to `real-time-forum/frontend/`
    - [X] Move `client/css/create-post.css` to `real-time-forum/frontend/css/`
    - [X] Move `client/css/home.css` to `real-time-forum/frontend/css/`
    - [X] Move `client/css/login.css` to `real-time-forum/frontend/css/`
    - [X] Move `client/css/nav.css` to `real-time-forum/frontend/css/`
    - [X] Move `client/css/post-details.css` to `real-time-forum/frontend/css/`
    - [X] Move `client/css/register.css` to `real-time-forum/frontend/css/`
    - [X] Move `client/js/Activity.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/CreatePost.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/Index.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/Login.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/nav.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/notifications.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/postDetails.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/Register.js` to `real-time-forum/frontend/js/`
    - [X] Move `client/js/stats.js` to `real-time-forum/frontend/js/`
- [X] Clean up any empty directories.
    - [X] Use `find real-time-forum -type d -empty -delete` to remove empty directories.


# Task 1.5: Create the Database
- Files: `backend/utils/db.go`

- [X] Subtask 1: Define the database connection
    - [X] Open `backend/utils/db.go`.
    - [X] Define a function `ConnectDB` to establish a connection to the database.
    - [X] Use a suitable Go package (e.g., `gorm` or `database/sql`) for database operations.
    - [X] Configure the database connection parameters (e.g., host, port, user, password, dbname).

- [X] Subtask 2: Create database tables
    - [X] Define functions to create tables for `User`, `Post`, `Comment`, `Like`, and `Message` models.
    - [X] Ensure that the tables are created if they do not already exist.

- [X] Subtask 3: Initialize the database
    - [X] Call the `ConnectDB` function in the main application entry point (`backend/main.go`).
    - [X] Ensure that the database connection is established when the application starts.
    - [X] Log any errors that occur during the database connection process.

# Task 2: Implement Registration and Login
- Files: `backend/handlers/auth.go`, `backend/models/user.go`, `frontend/js/auth.js`, `frontend/index.html`

- [X] Subtask 1: Backend - User Model
    - [X] Define the User model with fields: Nickname, Age, Gender, First Name, Last Name, Email, Password.
        - [X] Open `backend/models/user.go`.
        - [X] Define a struct `User` with the mentioned fields.
        - [X] Add JSON tags to each field for proper JSON serialization.
    - [X] Implement methods for creating and retrieving users.
        - [X] Create a method `CreateUser` to insert a new user into the database.
        - [X] Create a method `GetUserByEmail` to retrieve a user by email.
        - [X] Create a method `GetUserByNickname` to retrieve a user by nickname.

- [X] Subtask 2: Backend - Authentication Handlers
    - [X] Implement registration handler to create a new user.
        - [X] Open `backend/handlers/auth.go`.
        - [X] Create a function `RegisterHandler` to handle user registration.
        - [X] Validate the input data.
        - [X] Hash the user's password using bcrypt.
        - [X] Call `CreateUser` method to save the user in the database.
        - [X] Return a success response.
    - [X] Implement login handler to authenticate a user.
        - [X] Create a function `LoginHandler` to handle user login.
        - [X] Validate the input data.
        - [X] Retrieve the user by email or nickname.
        - [X] Compare the hashed password with the provided password.
        - [X] Generate a session token or JWT.
        - [X] Return the token in the response.
    - [X] Implement logout handler to end the user session.
        - [X] Create a function `LogoutHandler` to handle user logout.
        - [X] Invalidate the user's session token.
        - [X] Return a success response.

- [X] Subtask 3: Frontend - Registration and Login Forms
    - [X] Create registration form in `index.html`.
        - [X] Open `frontend/index.html`.
        - [X] Add a form with fields: Nickname, Age, Gender, First Name, Last Name, Email, Password.
        - [X] Add a submit button to the form.
    - [X] Create login form in `index.html`.
        - [X] Add a form with fields: Email/Nickname, Password.
        - [X] Add a submit button to the form.
    - [X] Implement JavaScript functions to handle form submissions and communicate with the backend.
        - [X] Open `frontend/js/auth.js`.
        - [X] Create a function `registerUser` to handle registration form submission.
            - [X] Prevent the default form submission.
            - [X] Collect form data.
            - [X] Send a POST request to the backend registration endpoint.
            - [X] Handle the response and show appropriate messages.
        - [X] Create a function `loginUser` to handle login form submission.
            - [X] Prevent the default form submission.
            - [X] Collect form data.
            - [X] Send a POST request to the backend login endpoint.
            - [X] Handle the response and store the session token.

# Task 3: Implement Post Creation and Commenting
- Files: `backend/handlers/posts.go`, `backend/handlers/comments.go`, `backend/models/post.go`, `backend/models/comment.go`, `frontend/js/posts.js`, `frontend/js/comments.js`, `frontend/index.html`

- [ ] Subtask 1: Backend - Post Model
    - [ ] Define the Post model with fields: ID, Title, Content, Category, AuthorID, CreatedAt.
        - [ ] Open `backend/models/post.go`.
        - [ ] Define a struct `Post` with the mentioned fields.
        - [ ] Add JSON tags to each field for proper JSON serialization.
    - [ ] Implement methods for creating and retrieving posts.
        - [ ] Create a method `CreatePost` to insert a new post into the database.
        - [ ] Create a method `GetPosts` to retrieve all posts.

- [ ] Subtask 2: Backend - Comment Model
    - [ ] Define the Comment model with fields: ID, PostID, Content, AuthorID, CreatedAt.
        - [ ] Open `backend/models/comment.go`.
        - [ ] Define a struct `Comment` with the mentioned fields.
        - [ ] Add JSON tags to each field for proper JSON serialization.
    - [ ] Implement methods for creating and retrieving comments.
        - [ ] Create a method `CreateComment` to insert a new comment into the database.
        - [ ] Create a method `GetCommentsByPostID` to retrieve comments for a specific post.

- [ ] Subtask 3: Backend - Post Handlers
    - [ ] Implement handler to create a new post.
        - [ ] Open `backend/handlers/posts.go`.
        - [ ] Create a function `CreatePostHandler` to handle post creation.
        - [ ] Validate the input data.
        - [ ] Call `CreatePost` method to save the post in the database.
        - [ ] Return a success response.
    - [ ] Implement handler to retrieve posts.
        - [ ] Create a function `GetPostsHandler` to handle retrieving posts.
        - [ ] Call `GetPosts` method to get all posts from the database.
        - [ ] Return the posts in the response.

- [ ] Subtask 4: Backend - Comment Handlers
    - [ ] Implement handler to create a new comment.
        - [ ] Open `backend/handlers/comments.go`.
        - [ ] Create a function `CreateCommentHandler` to handle comment creation.
        - [ ] Validate the input data.
        - [ ] Call `CreateComment` method to save the comment in the database.
        - [ ] Return a success response.
    - [ ] Implement handler to retrieve comments for a post.
        - [ ] Create a function `GetCommentsHandler` to handle retrieving comments for a post.
        - [ ] Call `GetCommentsByPostID` method to get comments for the specified post.
        - [ ] Return the comments in the response.

- [ ] Subtask 5: Frontend - Post Creation and Display
    - [ ] Create post creation form in `index.html`.
        - [ ] Open `frontend/index.html`.
        - [ ] Add a form with fields: Title, Content, Category.
        - [ ] Add a submit button to the form.
    - [ ] Implement JavaScript functions to handle post creation and display posts in a feed.
        - [ ] Open `frontend/js/posts.js`.
        - [ ] Create a function `createPost` to handle post creation form submission.
            - [ ] Prevent the default form submission.
            - [ ] Collect form data.
            - [ ] Send a POST request to the backend post creation endpoint.
            - [ ] Handle the response and show appropriate messages.
        - [ ] Create a function `displayPosts` to fetch and display posts.
            - [ ] Send a GET request to the backend posts endpoint.
            - [ ] Render the posts in a feed format.

- [ ] Subtask 6: Frontend - Commenting
    - [ ] Implement JavaScript functions to handle comment creation and display comments when a post is clicked.
        - [ ] Open `frontend/js/comments.js`.
        - [ ] Create a function `createComment` to handle comment creation form submission.
            - [ ] Prevent the default form submission.
            - [ ] Collect form data.
            - [ ] Send a POST request to the backend comment creation endpoint.
            - [ ] Handle the response and show appropriate messages.
        - [ ] Create a function `displayComments` to fetch and display comments for a post.
            - [ ] Send a GET request to the backend comments endpoint with the post ID.
            - [ ] Render the comments under the respective post.

# Task 4: Implement Like and Dislike Functionality
- Files: `backend/handlers/likes.go`, `backend/models/like.go`, `backend/database/db_like.go`, `frontend/js/likes.js`, `frontend/index.html`

- [ ] Subtask 1: Backend - Like Model
    - [ ] Define the Like model with fields: ID, UserID, PostID, CommentID, Liked.
        - [ ] Open `backend/models/like.go`.
        - [ ] Define a struct `Like` with the mentioned fields.
        - [ ] Add JSON tags to each field for proper JSON serialization.
    - [ ] Implement methods for creating and retrieving likes.
        - [ ] Create a method `CreateLike` to insert a new like into the database.
        - [ ] Create a method `GetLikesByPostID` to retrieve likes for a specific post.
        - [ ] Create a method `GetLikesByCommentID` to retrieve likes for a specific comment.

- [ ] Subtask 2: Backend - Like Handlers
    - [ ] Implement handler to create a new like or dislike for a post.
        - [ ] Open `backend/handlers/likes.go`.
        - [ ] Create a function `LikePostHandler` to handle liking or disliking a post.
        - [ ] Validate the input data.
        - [ ] Call `CreateLike` method to save the like in the database.
        - [ ] Return a success response.
    - [ ] Implement handler to create a new like or dislike for a comment.
        - [ ] Create a function `LikeCommentHandler` to handle liking or disliking a comment.
        - [ ] Validate the input data.
        - [ ] Call `CreateLike` method to save the like in the database.
        - [ ] Return a success response.

- [ ] Subtask 3: Frontend - Like and Dislike Functionality
    - [ ] Implement JavaScript functions to handle liking and disliking posts and comments.
        - [ ] Open `frontend/js/likes.js`.
        - [ ] Create a function `likePost` to handle liking or disliking a post.
            - [ ] Send a POST request to the backend like endpoint with the post ID and like status.
            - [ ] Handle the response and update the like count for the post.
        - [ ] Create a function `likeComment` to handle liking or disliking a comment.
            - [ ] Send a POST request to the backend like endpoint with the comment ID and like status.
            - [ ] Handle the response and update the like count for the comment.

- [ ] Subtask 4: Update Frontend to Display Like and Dislike Counts
    - [ ] Modify the post and comment display functions to include like and dislike counts.
        - [ ] Open `frontend/js/posts.js` and `frontend/js/comments.js`.
        - [ ] Update the `displayPosts` and `displayComments` functions to fetch and display like and dislike counts.



# Task 5: Implement Private Messaging
- Files: `backend/handlers/messages.go`, `backend/models/message.go`, `backend/websockets/hub.go`, `backend/websockets/client.go`, `backend/websockets/message.go`, `frontend/js/messages.js`, `frontend/index.html`

- [ ] Subtask 1: Backend - Message Model
    - [ ] Define the Message model with fields: ID, SenderID, ReceiverID, Content, CreatedAt.
        - [ ] Open `backend/models/message.go`.
        - [ ] Define a struct `Message` with the mentioned fields.
        - [ ] Add JSON tags to each field for proper JSON serialization.
    - [ ] Implement methods for creating and retrieving messages.
        - [ ] Create a method `CreateMessage` to insert a new message into the database.
        - [ ] Create a method `GetMessagesByUserIDs` to retrieve messages between two users.

- [ ] Subtask 2: Backend - WebSocket Setup
    - [ ] Implement WebSocket hub to manage connections.
        - [ ] Open `backend/websockets/hub.go`.
        - [ ] Define a struct `Hub` to manage active connections and broadcast messages.
        - [ ] Implement methods to add, remove, and broadcast to connections.
    - [ ] Implement WebSocket client to handle individual connections.
        - [ ] Open `backend/websockets/client.go`.
        - [ ] Define a struct `Client` to represent a WebSocket connection.
        - [ ] Implement methods to read and write messages.
    - [ ] Implement message handling through WebSockets.
        - [ ] Open `backend/websockets/message.go`.
        - [ ] Define message types and structures.
        - [ ] Implement functions to handle incoming and outgoing messages.

- [ ] Subtask 3: Backend - Message Handlers
    - [ ] Implement handler to retrieve messages between users.
        - [ ] Open `backend/handlers/messages.go`.
        - [ ] Create a function `GetMessagesHandler` to handle retrieving messages.
        - [ ] Call `GetMessagesByUserIDs` method to get messages between the specified users.
        - [ ] Return the messages in the response.
    - [ ] Implement handler to send a new message.
        - [ ] Create a function `SendMessageHandler` to handle sending a new message.
        - [ ] Call `CreateMessage` method to save the message in the database.
        - [ ] Broadcast the message to the recipient via WebSocket.
        - [ ] Return a success response.

- [ ] Subtask 4: Frontend - Messaging Interface
    - [ ] Create messaging interface in `index.html`.
        - [ ] Open `frontend/index.html`.
        - [ ] Add a section to display online/offline users.
        - [ ] Add a section to display the chat history with a selected user.
        - [ ] Add a form to send new messages.
    - [ ] Implement JavaScript functions to handle sending and receiving messages in real-time.
        - [ ] Open `frontend/js/messages.js`.
        - [ ] Create a function `sendMessage` to handle message form submission.
            - [ ] Prevent the default form submission.
            - [ ] Collect form data.
            - [ ] Send a POST request to the backend message endpoint.
            - [ ] Handle the response and update the chat history.
        - [ ] Create a function `receiveMessage` to handle incoming messages via WebSocket.
            - [ ] Update the chat history with the new message.
        - [ ] Create a function `loadChatHistory` to fetch and display previous messages with a user.
            - [ ] Send a GET request to the backend messages endpoint with the user ID.
            - [ ] Render the messages in the chat history section.

# Task 6: Implement User Interface and Styling
- Files: `frontend/css/styles.css`, `frontend/index.html`

- [ ] Subtask 1: Create a consistent layout for the application.
    - [ ] Design the layout in `index.html`.
        - [ ] Create a header section for the navigation bar.
        - [ ] Create a main content section for displaying different views (posts, comments, messages).
        - [ ] Create a footer section if needed.
    - [ ] Apply styles in `styles.css`.
        - [ ] Style the header, main content, and footer sections.
        - [ ] Ensure a responsive design for different screen sizes.

- [ ] Subtask 2: Implement navigation
    - [ ] Create a navigation bar in `index.html`.
        - [ ] Add links for different sections (Home, Posts, Messages, Profile).
        - [ ] Add a logout button.
    - [ ] Implement JavaScript functions to handle navigation between different sections of the application.
        - [ ] Open `frontend/js/app.js`.
        - [ ] Create a function `navigateTo` to handle navigation.
            - [ ] Update the main content section based on the selected link.
            - [ ] Highlight the active link in the navigation bar.

# Task 7: Testing and Debugging
- Files: `backend/main_test.go`

- [ ] Subtask 1: Write unit tests for backend handlers and models.
    - [ ] Open `backend/main_test.go`.
    - [ ] Write tests for `RegisterHandler`, `LoginHandler`, and `LogoutHandler`.
    - [ ] Write tests for `CreatePostHandler` and `GetPostsHandler`.
    - [ ] Write tests for `CreateCommentHandler` and `GetCommentsHandler`.
    - [ ] Write tests for `SendMessageHandler` and `GetMessagesHandler`.

- [ ] Subtask 2: Perform end-to-end testing of the application.
    - [ ] Test the registration and login process.
    - [ ] Test post creation and commenting.
    - [ ] Test private messaging functionality.

- [ ] Subtask 3: Debug and fix any issues that arise during testing.
    - [ ] Use console logs and breakpoints to identify issues.
    - [ ] Fix any bugs and retest the affected functionality.

# Task 8: Documentation
- Files: `README.md`

- [ ] Subtask 1: Update `README.md` with project description, setup instructions, and usage guide.
    - [ ] Describe the project and its features.
    - [ ] Provide instructions for setting up the development environment.
    - [ ] Include usage examples and API endpoint details.

- [ ] Subtask 2: Document API endpoints and their usage.
    - [ ] List all API endpoints with their request and response formats.
    - [ ] Provide examples of how to use each endpoint.

- [ ] Subtask 3: Document WebSocket communication protocol.
    - [ ] Describe the WebSocket setup and message formats.
    - [ ] Provide examples of sending and receiving messages via WebSocket.
