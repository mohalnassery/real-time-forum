# Real-Time Forum

## Overview
Real-Time Forum is a one page web application designed to facilitate real-time communication and interaction among users. It allows users to register, log in, create posts, comment on posts, and send private messages in real-time. The application leverages WebSockets for real-time communication and is built using Go for the backend and JavaScript for the frontend.

## Objectives
The main objectives of this project are:
- **User Registration and Login**: Secure user authentication.
- **Post Creation and Commenting**: Users can create posts and comment on them.
- **Private Messaging**: Real-time private messaging between users.
- **User Profiles and Statistics**: Display user profiles and activity statistics.
- **WebSocket-based Notifications**: Real-time notifications for various user activities.

## Features
- User Registration and Login
- Post Creation and Commenting
- Real-Time Private Messaging
- User Profiles and Statistics
- WebSocket-based Notifications

## Project Structure
```
real-time-forum/
├── backend/
│   ├── handlers/
│   ├── models/
│   ├── utils/
│   ├── websockets/
│   ├── main.go
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── assets/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Prerequisites
- Go 1.22.2 or later
- Docker
- Docker Compose

## Setup Instructions

### Running the Server Directly
1. **Clone the repository:**


2. **Navigate to the backend directory:**
   ```sh
   cd backend
   ```

3. **Install Go dependencies:**
   ```sh
   go mod tidy
   ```

4. **Run the server:**
   ```sh
   go run main.go
   ```

5. **Open the application in your browser:**
   Navigate to `http://localhost:8080` to access the Real-Time Forum.

### Running the Server with Docker

1. **Build and start the Docker containers:**
   ```sh
   docker-compose up --build
   ```

2. **Open the application in your browser:**
   Navigate to `http://localhost:8080` to access the Real-Time Forum.

## API Endpoints
### Authentication
- **POST /register**: Register a new user
- **POST /login**: Log in an existing user
- **POST /logout**: Log out the current user

### Posts
- **POST /posts**: Create a new post
- **GET /posts**: Retrieve all posts

### Comments
- **POST /comments**: Create a new comment
- **GET /comments/:postId**: Retrieve comments for a specific post

### Messages
- **POST /messages**: Send a new message
- **GET /messages/:userId**: Retrieve messages between users

## WebSocket Communication
### WebSocket Endpoint
- **ws://localhost:8080/ws**: WebSocket connection for real-time messaging

### Message Types
- **typing**: Indicates that a user is typing
- **stop typing**: Indicates that a user has stopped typing
- **message**: A new chat message

## Development
### Running in Development Mode
1. **Start the Docker containers:**
   ```sh
   docker-compose up --build
   ```

2. **Open the application in your browser:**
   Navigate to `http://localhost:8080` to access the Real-Time Forum in development mode.


## Developers
- Mohamed Abdulla
- Ammar Saead