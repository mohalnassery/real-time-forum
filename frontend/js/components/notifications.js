import { openChat } from './chat/chat.js';
import { openChatBox } from './websocket/chat_box.js';

async function fetchNotifications(onlyUnread = false) {
  try {
    const response = await fetch(`/notifications${onlyUnread ? '?unread=true' : ''}`);
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

async function fetchAndDisplayNotifications(onlyUnread = false) {
  const notifications = await fetchNotifications(onlyUnread);
  displayNotifications(notifications);
}

function displayNotifications(notifications) {
  
  const notificationDropdown = document.querySelector(".notification-dropdown");
  notificationDropdown.innerHTML = ""; // Clear existing notifications

  // Ensure notifications is an array
  if (!Array.isArray(notifications)) {
    notifications = [];
  }
  console.log("notifications", notifications);
  // filter out the read notifications
  const unreadNotifications = notifications.filter(notification => !notification.isRead);

  unreadNotifications.forEach((notification) => {
    const notificationItem = document.createElement("div");
    notificationItem.className = "notification-item";
    notificationItem.textContent = notification.message;
    notificationItem.dataset.senderId = notification.senderId ? notification.senderId.toString() : '';
    notificationItem.dataset.postId = notification.postId ? notification.postId.toString() : '';
    notificationItem.dataset.commentId = notification.commentId ? notification.commentId.toString() : '';
    notificationItem.addEventListener("click", () => {
      if (notification.messageId) {
        const user = { id: notification.senderId, nickname: notification.message.split(':')[0].split('from ')[1] };
        if (document.getElementById('chat-main')) {
          // If we're on the chat page
          openChat(notification.senderId, user.nickname);
        } else {
          // If we're not on the chat page
          openChatBox(user);
        }
        clearAllChatNotifications(notification.messageId);
      } else if (notification.postId) {
        // Handle post notification click
      } else if (notification.commentId) {
        // Handle comment notification click
      }
    });
    notificationDropdown.appendChild(notificationItem);
  });

  // Add "Mark all as read" option
  const markAllRead = document.createElement("div");
  markAllRead.className = "mark-all-read";
  markAllRead.textContent = "Mark all as read";
  markAllRead.addEventListener("click", markAllNotificationsAsRead);
  notificationDropdown.appendChild(markAllRead);
}

async function clearNotification(notificationId) {
  try {
    const response = await fetch(`/notifications/clear/${notificationId}`, {
      method: "POST",
    });
    if (response.ok) {
      const data = await response.json();
      const senderId = data.senderId;
      if (senderId) {
        openChatBox({ id: senderId, nickname: data.senderNickname });
      } else {
        console.error("Sender ID not found in the response");
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
      fetchAndDisplayNotifications(); // Refresh notifications and show all
    } else {
      console.error("Error marking all notifications as read:", response.status);
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

async function updateNotificationCounter(count, increment = false) {
  const counterElement = document.getElementById("notification-counter");
  if (increment) {
    count = parseInt(counterElement.textContent || "0") + count;
  }
  if (count > 0) {
      counterElement.textContent = count > 99 ? "99+" : count;
      counterElement.hidden = false;
  } else {
      counterElement.textContent = "0"
      counterElement.hidden = true;
  }
}

async function clearAllChatNotifications(userId) {
    const notificationItems = document.querySelectorAll(".notification-item");
    let removedCount = 0;
    notificationItems.forEach(item => {
        if (item.dataset.senderId === userId.toString()) {
            item.remove();
            removedCount++;
        }
    });
    updateNotificationCounter(-removedCount);
}

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

// async function addNotificationToDropdown(notification) {
//   const notificationDropdown = document.querySelector(".notification-dropdown");
//   const existingNotification = Array.from(notificationDropdown.children).find(
//     (item) => item.dataset.senderId === notification.messageId.toString()
//   );

//   if (!existingNotification) {
//     const notificationItem = document.createElement("div");
//     notificationItem.className = "notification-item";
//     notificationItem.textContent = notification.message;
//     notificationItem.dataset.senderId = notification.messageId ? notification.messageId.toString() : '';
//     notificationItem.dataset.postId = notification.postId ? notification.postId.toString() : '';
//     notificationItem.dataset.commentId = notification.commentId ? notification.commentId.toString() : '';
//     notificationItem.addEventListener("click", () => {
//       if (notification.messageId) {
//         const user = { id: notification.messageId, nickname: notification.message.split(':')[0].split('from ')[1] };
//         if (document.getElementById('chat-main')) {
//           // If we're on the chat page
//           openChat(notification.messageId, user.nickname);
//         } else {
//           // If we're not on the chat page
//           openChatBox(user);
//         }
//         clearAllChatNotifications(notification.messageId);
//       } else if (notification.postId) {
//         // Handle post notification click
//       } else if (notification.commentId) {
//         // Handle comment notification click
//       }
//     });
//     notificationDropdown.insertBefore(notificationItem, notificationDropdown.firstChild);
//   }
// }

// Export functions to be used in other files
export { fetchAndDisplayNotifications, clearNotification, markAllNotificationsAsRead, updateNotificationCounter, clearAllChatNotifications, markAllChatNotificationsAsRead };
// export { addNotificationToDropdown };