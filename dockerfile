# Use the official Golang image as the base image
FROM golang:latest

# Set the working directory inside the container
WORKDIR /backend

# Install SQLCipher dependencies
RUN apt-get update && apt-get install -y libsqlcipher-dev

# Copy the Go module files and download dependencies
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy the rest of the server code
COPY backend /backend

# Build the Go application
RUN go build -o main .

# Copy the client code (if needed)
COPY frontend /frontend

# Verify that the main file exists
RUN ls -l /backend

# Set the entrypoint to the built executable
CMD ["./main"]
