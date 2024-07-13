const socket = new WebSocket("ws://localhost:8080/ws");

socket.onopen = function(event) {
    console.log("WebSocket is open now.");
};

socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log("WebSocket message received:", message);
    // Handle the message (e.g., update the UI)
};

socket.onclose = function(event) {
    console.log("WebSocket is closed now.");
};

socket.onerror = function(error) {
    console.log("WebSocket error:", error);
};

// // Function to send a message
// export function sendMessage(message) {
//     socket.send(JSON.stringify(message));
// }