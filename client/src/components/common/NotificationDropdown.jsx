import { Bell, Loader2 } from "lucide-react";

import NotificationCard from "./NotificationCard";

const NotificationDropdown = ({
  notifications,
  loading,
  unreadCount,
  refreshNotifications,
  onNotificationClick,
  onViewAll,
}) => {
  return (
    <div className="absolute right-0 mt-3 w-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}

      <div className="border-b bg-gradient-to-r from-blue-50 to-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>

            <p className="mt-1 text-xs text-gray-500">
              {notifications.length} Notification
              {notifications.length !== 1 && "s"}
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-white">
                  {unreadCount} New
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Body */}

      <div className="max-h-[430px] overflow-y-auto">
        {/* Loading */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-14">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */

          <div className="flex flex-col items-center px-6 py-14">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>

            <h4 className="mt-5 text-lg font-semibold text-gray-800">
              No Notifications Yet
            </h4>

            <p className="mt-2 text-center text-sm text-gray-500">
              Trip updates, wishlist activity and important alerts will appear
              here.
            </p>
          </div>
        ) : (
          /* Notifications */

          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                variant="dropdown"
                refreshNotifications={refreshNotifications}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
      {/* Footer */}

      {notifications.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            onClick={onViewAll}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;