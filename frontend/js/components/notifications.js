import { updateNotificationCounter } from './nav.js';

async function fetchNotifications() {
  try {
    const response = await fetch("/notifications");
    if (response.ok) {
      const data = await response.json();
      const notifications = data.notifications;
      const unreadCount = data.unreadCount;
      updateNotificationCounter(unreadCount); // Update the counter
      return notifications; // Return notifications
    } else {
      console.error("Error fetching notifications:", response.status);
      return []; // Return empty array
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return []; // Return empty array
  }
}

function displayNotifications(notifications) {
  const notificationDropdown = document.querySelector(".notification-dropdown");
  notificationDropdown.innerHTML = ""; // Clear existing notifications

  // Ensure notifications is an array
  if (!Array.isArray(notifications)) {
    notifications = [];
  }

  // Filter out read notifications
  const unreadNotifications = notifications.filter(notification => !notification.is_read);

  if (unreadNotifications.length > 0) {
    unreadNotifications.forEach((unreadNotification) => {
      const notificationItem = document.createElement("div");
      notificationItem.className = "notification-item";
      notificationItem.textContent = unreadNotification.message;
      notificationItem.addEventListener("click", () => clearNotification(unreadNotification.id));
      notificationDropdown.appendChild(notificationItem);
    });

    // Add "Mark all as read" option
    const markAllRead = document.createElement("div");
    markAllRead.className = "mark-all-read";
    markAllRead.textContent = "Mark all as read";
    markAllRead.addEventListener("click", markAllNotificationsAsRead);
    notificationDropdown.appendChild(markAllRead);
  } else {
    const noNotifications = document.createElement("div");
    noNotifications.className = "notification-item";
    noNotifications.textContent = "NO NEW NOTIFICATION";
    notificationDropdown.appendChild(noNotifications);
  }
}

async function clearNotification(notificationId) {
  try {
    const response = await fetch(`/notifications/clear/${notificationId}`, {
      method: "POST",
    });
    if (response.ok) {
      const data = await response.json();
      const postID = data.postID;
      if (postID) {
        window.location.href = `/#post/${postID}`; // Redirect to the new URL format
      } else {
        console.error("Post ID not found in the response");
      }
    } else {
      console.error("Error clearing notification:", response.status);
    }
  } catch (error) {
    console.error("Error clearing notification:", error);
  }
}

async function markAllNotificationsAsRead() {
  try {
    const response = await fetch("/notifications/mark-all-read", {
      method: "POST",
    });
    if (response.ok) {
      fetchAndDisplayNotifications(); // Refresh notifications
    } else {
      console.error("Error marking all notifications as read:", response.status);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

async function fetchAndDisplayNotifications() {
  const notifications = await fetchNotifications();
  displayNotifications(notifications);
}

// Export functions to be used in other files
export { fetchAndDisplayNotifications, clearNotification, markAllNotificationsAsRead };
