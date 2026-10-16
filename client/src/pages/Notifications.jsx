import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBell,
  FaArrowLeft,
  FaTrashAlt,
} from "react-icons/fa";

import NotificationCard from "../components/common/NotificationCard";

import {
  getNotifications,
  clearNotifications,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Clear All Notifications
  const handleClearAll = async () => {
    try {
      await clearNotifications();

      fetchNotifications();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear notifications");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:mb-6 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            {/* Back Button and Heading */}
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link
                to="/dashboard"
                aria-label="Back to Dashboard"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:h-11 sm:w-11"
              >
                <FaArrowLeft className="text-sm text-gray-700 sm:text-base" />
              </Link>

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-12 sm:w-12">
                  <FaBell className="text-lg text-blue-600 sm:text-xl" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold leading-tight text-gray-800 sm:text-2xl lg:text-3xl">
                    Notifications
                  </h1>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {notifications.length} Notification
                    {notifications.length !== 1 && "s"}
                  </p>
                </div>
              </div>
            </div>

            {/* Clear All */}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:w-auto sm:text-base"
              >
                <FaTrashAlt />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-md sm:p-12">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent sm:h-12 sm:w-12"></div>

            <p className="mt-4 text-base text-gray-600 sm:mt-5 sm:text-lg">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center shadow-md sm:px-6 sm:py-20 lg:py-24">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 sm:h-24 sm:w-24">
              <FaBell className="text-3xl text-blue-600 sm:text-4xl" />
            </div>

            <h2 className="mt-5 text-2xl font-bold leading-tight text-gray-800 sm:mt-6 sm:text-3xl">
              No Notifications Yet
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
              Trip updates, wishlist activity and important alerts will appear
              here.
            </p>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                refreshNotifications={fetchNotifications}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
