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
        return <FaPlaneDeparture className="text-xl text-blue-600" />;

      case "wishlist":
        return <FaHeart className="text-xl text-pink-500" />;

      case "admin":
        return <FaUserShield className="text-xl text-purple-600" />;

      default:
        return <FaBell className="text-xl text-gray-600" />;
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
      className={`group relative cursor-pointer border-l-4 ${getBorderColor()}
${
  variant === "dropdown"
    ? "px-4 py-3"
    : "rounded-2xl p-5 shadow-sm hover:shadow-xl"
}
bg-white transition-all duration-300`}
    >
      {/* Unread Dot */}

      {!notification.isRead && (
        <span className="absolute right-5 top-5 h-3 w-3 animate-pulse rounded-full bg-blue-500"></span>
      )}

      {/* Delete Button */}

      {variant === "page" && (
        <button
          onClick={handleDelete}
          className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 transition-all duration-200 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
        >
          <FaTrash />
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Notification Icon */}

        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
          {getIcon()}
        </div>

        {/* Notification Content */}

        <div className={variant === "page" ? "flex-1 pr-12" : "flex-1"}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {notification.title}
            </h3>

            <span className="text-sm text-gray-500">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>

          <p className="mt-2 leading-relaxed text-gray-600">
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
