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
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition hover:bg-blue-100"
              >
                <FaArrowLeft className="text-gray-700" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FaBell className="text-xl text-blue-600" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Notifications
                  </h1>

                  <p className="mt-1 text-gray-500">
                    {notifications.length} Notification
                    {notifications.length !== 1 && "s"}
                  </p>
                </div>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700"
              >
                <FaTrashAlt />
                Clear All
              </button>
            )}
          </div>
        </div>
        {/* Loading */}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

            <p className="mt-5 text-lg text-gray-600">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */

          <div className="rounded-2xl border border-gray-200 bg-white py-24 text-center shadow-md">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <FaBell className="text-4xl text-blue-600" />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-gray-800">
              No Notifications Yet
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-gray-500">
              Trip updates, wishlist activity and important alerts will appear
              here.
            </p>
          </div>
        ) : (
          /* Notification List */

          <div className="space-y-4">
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