import toast from "react-hot-toast";

import {
  FaPlaneDeparture,
  FaHeart,
  FaUserShield,
  FaBell,
  FaTrash,
} from "react-icons/fa";

import {
  markNotificationAsRead,
  deleteNotification,
} from "../../services/notificationService";

function NotificationCard({
  notification,
  refreshNotifications,
  variant = "page",
  onClick,
}) {
  // Relative Time

  const getRelativeTime = (date) => {
    const now = new Date();

    const created = new Date(date);

    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return created.toLocaleDateString();
  };

  // Notification Icon

  const getIcon = () => {
    switch (notification.type) {
      case "trip":
        return <FaPlaneDeparture className="text-lg text-blue-600 sm:text-xl" />;

      case "wishlist":
        return <FaHeart className="text-lg text-pink-500 sm:text-xl" />;

      case "admin":
        return <FaUserShield className="text-lg text-purple-600 sm:text-xl" />;

      default:
        return <FaBell className="text-lg text-gray-600 sm:text-xl" />;
    }
  };

  // Left Border Color

  const getBorderColor = () => {
    switch (notification.type) {
      case "trip":
        return "border-blue-500";

      case "wishlist":
        return "border-pink-500";

      case "admin":
        return "border-purple-500";

      default:
        return "border-gray-300";
    }
  };

  // Notification Click

  const handleNotificationClick = async () => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
      }

      refreshNotifications?.();

      if (onClick) {
        onClick(notification);
      }
    } catch (error) {
      console.error(error);

      toast.error("Failed to update notification");
    }
  };

  // Delete Notification

  const handleDelete = async (e) => {
    e.stopPropagation();

    try {
      await deleteNotification(notification._id);

      refreshNotifications();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete notification");
    }
  };

  return (
    <div
      onClick={handleNotificationClick}
      className={`group relative w-full min-w-0 cursor-pointer border-l-4 ${getBorderColor()}
${
  variant === "dropdown"
    ? "px-3 py-3 sm:px-4"
    : "rounded-xl p-3 shadow-sm hover:shadow-xl sm:rounded-2xl sm:p-5"
}
bg-white transition-all duration-300`}
    >
      {/* Unread Dot */}

      {!notification.isRead && (
        <span className="absolute right-3 top-3 h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500 sm:right-5 sm:top-5 sm:h-3 sm:w-3"></span>
      )}

      {/* Delete Button */}

      {variant === "page" && (
        <button
          onClick={handleDelete}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600 sm:bottom-4 sm:right-4 sm:h-10 sm:w-10 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <FaTrash />
        </button>
      )}

      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {/* Notification Icon */}

        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-14 sm:w-14 sm:rounded-xl">
          {getIcon()}
        </div>

        {/* Notification Content */}

        <div
          className={
            variant === "page"
              ? "min-w-0 flex-1 pb-10 sm:pr-12 sm:pb-0"
              : "min-w-0 flex-1"
          }
        >
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
            <h3 className="break-words pr-4 text-base font-semibold text-gray-800 sm:pr-0 sm:text-lg">
              {notification.title}
            </h3>

            <span className="text-xs text-gray-500 sm:text-sm">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>

          <p className="mt-2 break-words text-sm leading-relaxed text-gray-600 sm:text-base">
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
