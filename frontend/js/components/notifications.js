import { openChat } from './chat/chat.js';
import { openChatBox } from './websocket/chat_box.js';

// Fetch notifications from the server
async function fetchNotifications(onlyUnread = false) {
  try {
    const response = await fetch(`/notifications${onlyUnread ? '?unread=true' : ''}`);
    if (response.ok) {
      const data = await response.json();
      const notifications = data.notifications;
      const unreadCount = data.unreadCount;
      updateNotificationCounter(unreadCount); // Update the notification counter
      return notifications; // Return the fetched notifications
    } else {
      console.error("Error fetching notifications:", response.status);
      return []; // Return an empty array on error
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return []; // Return an empty array on error
  }
}

// Fetch and display notifications
async function fetchAndDisplayNotifications(onlyUnread = false) {
  const notifications = await fetchNotifications(onlyUnread);
  displayNotifications(notifications); // Display the fetched notifications
}

// Display notifications in the dropdown
function displayNotifications(notifications) {
  const notificationDropdown = document.querySelector(".notification-dropdown");
  notificationDropdown.innerHTML = ""; // Clear existing notifications

  // Ensure notifications is an array
  if (!Array.isArray(notifications)) {
    notifications = [];
  }

  // Filter out the read notifications
  const unreadNotifications = notifications.filter(notification => !notification.isRead);
  unreadNotifications.forEach((notification) => {
    const notificationItem = document.createElement("div");
    notificationItem.className = "notification-item";
    notificationItem.textContent = notification.message; // Set notification message
    notificationItem.dataset.notificationId = notification.id.toString();
    notificationItem.dataset.senderId = notification.senderId ? notification.senderId.toString() : '';
    notificationItem.dataset.postId = notification.postId ? notification.postId.toString() : '';
    notificationItem.dataset.commentId = notification.commentId ? notification.commentId.toString() : '';
    notificationItem.dataset.messageId = notification.messageId ? notification.messageId.toString() : '';

    // Add click event to handle notification actions
    notificationItem.addEventListener("click", async () => {
      if (notification.postId !== 0 && notification.messageId === 0) {
        // Navigate to the post
        await clearNotification(notification.id); // Clear the notification
        updateNotificationCounter(-1, true); // Decrement the counter by 1
        window.location.href = `http://localhost:8080/#post/${notification.postId}`;
      } else if (notification.messageId !== 0) {
        // Navigate to the chat
        const user = { id: notification.senderId, nickname: notification.message.split('from ')[1], status: notification.status };
        if (document.getElementById('chat-main')) {
          // If we're on the chat page
          openChat(notification.senderId, user.nickname);
        } else {
          // If we're not on the chat page
          openChatBox(user);
        }
        clearAllChatNotifications(notification.messageId); // Clear chat notifications
      }
    });
    notificationDropdown.appendChild(notificationItem); // Append notification item to dropdown
  });

  // Add "Mark all as read" option
  const markAllRead = document.createElement("div");
  markAllRead.className = "mark-all-read";
  markAllRead.textContent = "Mark all as read";
  markAllRead.addEventListener("click", markAllNotificationsAsRead); // Add event to mark all as read
  notificationDropdown.appendChild(markAllRead); // Append to dropdown
}

// Clear a specific notification
async function clearNotification(notificationId) {
  try {
    const response = await fetch(`/notifications/clear/${notificationId}`, {
      method: "POST",
    });
    if (response.ok) {
      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        const senderId = data.senderId;
        if (senderId) {
          openChatBox({ id: senderId, nickname: data.senderNickname, status: data.senderStatus }); // Open chat box with sender
        } else {
          console.error("Sender ID not found in the response");
        }
      }
    } else {
      console.error("Error clearing notification:", response.status);
    }
  } catch (error) {
    console.error("Error clearing notification:", error);
  }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
  try {
    const response = await fetch("/notifications/mark-all-read", {
      method: "POST",
    });
    if (response.ok) {
      fetchAndDisplayNotifications(); // Refresh notifications and show all
    } else {
      console.error("Error marking all notifications as read:", response.status);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

// Update the notification counter
async function updateNotificationCounter(count, increment = false) {
  const counterElement = document.getElementById("notification-counter");
  if (increment) {
    count = parseInt(counterElement.textContent || "0") + count; // Increment the count
  }
  if (count > 0) {
    counterElement.textContent = count > 99 ? "99+" : count; // Update counter display
    counterElement.hidden = false; // Show counter
  } else {
    counterElement.textContent = "0"; // Reset counter
    counterElement.hidden = true; // Hide counter
  }
}

// Clear all chat notifications for a specific user
async function clearAllChatNotifications(userId) {
  const notificationItems = document.querySelectorAll(".notification-item");
  let removedCount = 0;
  notificationItems.forEach(item => {
    if (item.dataset.senderId === userId.toString()) {
      item.remove(); // Remove notification item
      removedCount++;
    }
  });
  updateNotificationCounter(-removedCount, true); // Update counter
}

// Mark all chat notifications as read for a specific user
async function markAllChatNotificationsAsRead(userId) {
  try {
    const response = await fetch(`/notifications/mark-chat-read/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      fetchAndDisplayNotifications(true); // Refresh notifications and show only unread
    } else {
      console.error("Error marking chat notifications as read:", response.status);
    }
  } catch (error) {
    console.error("Error marking chat notifications as read:", error);
  }
}

// Show a toast notification
function showNotification(message) {
  let toastNotification = document.querySelector(".toast-notification");
  const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message; // Truncate message if too long

  if (toastNotification) {
      // If a toast already exists, update its message and reset the timer
      toastNotification.textContent = truncatedMessage;
      toastNotification.classList.add("show"); // Ensure it is visible
      clearTimeout(toastNotification.timeoutId); // Clear the previous timeout
      toastNotification.timeoutId = setTimeout(() => {
          toastNotification.remove(); // Remove toast after timeout
      }, 5000); // 5000ms = 5 seconds
  } else {
      // Create a new toast notification element
      toastNotification = document.createElement("div");
      toastNotification.className = "toast-notification show"; // Add the show class to trigger the animation
      toastNotification.textContent = truncatedMessage;

      // Add the toast notification to the body
      document.body.appendChild(toastNotification);

      // Set a timer to remove the toast notification after some time
      toastNotification.timeoutId = setTimeout(() => {
          toastNotification.remove(); // Remove toast after timeout
      }, 5000); // 5000ms = 5 seconds
  }
}

// Handle incoming chat notifications
function handleChatNotification(message) {
  const currentUserId = parseInt(localStorage.getItem('userId'));
  if (message.receiverId === currentUserId) {
      const notificationMessage = `New message from ${message.senderNickname}: ${message.content}`;
      updateNotificationCounter(1, true); // Increment notification counter
      showNotification(notificationMessage); // Show a toast notification
  }
}

// Export functions to be used in other files
export { 
  fetchAndDisplayNotifications, 
  clearNotification, 
  markAllNotificationsAsRead, 
  updateNotificationCounter, 
  clearAllChatNotifications, 
  markAllChatNotificationsAsRead, 
  showNotification, 
  handleChatNotification 
};