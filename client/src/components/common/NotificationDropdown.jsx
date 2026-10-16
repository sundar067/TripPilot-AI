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
    <div className="fixed inset-x-3 top-28 z-50 flex max-h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:max-h-none sm:w-[420px] sm:rounded-2xl">
      {/* Header */}

      <div className="shrink-0 border-b bg-gradient-to-r from-blue-50 to-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-11 sm:w-11">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-800 sm:text-lg">
              Notifications
            </h3>

            <p className="mt-1 flex flex-wrap items-center gap-y-1 text-xs text-gray-500">
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sm:max-h-[430px] sm:flex-none">
        {loading ? (
          /* Loading */

          <div className="flex flex-col items-center justify-center px-4 py-12 sm:py-14">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

            <p className="mt-4 text-center text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */

          <div className="flex flex-col items-center px-4 py-8 sm:px-6 sm:py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 sm:h-16 sm:w-16">
              <Bell className="h-7 w-7 text-blue-600 sm:h-8 sm:w-8" />
            </div>

            <h4 className="mt-4 text-center text-base font-semibold text-gray-800 sm:mt-5 sm:text-lg">
              No Notifications Yet
            </h4>

            <p className="mt-2 max-w-xs text-center text-sm leading-6 text-gray-500">
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
        <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-3 sm:px-5 sm:py-4">
          <button
            onClick={onViewAll}
            className="w-full rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md sm:rounded-xl"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
