import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, ChevronDown } from "lucide-react";

import NotificationDropdown from "../common/NotificationDropdown";

import { getNotifications } from "../../services/notificationService";

import { socket } from "../../lib/socket";

const AdminNavbar = () => {
  const navigate = useNavigate();

  // Profile dropdown
  const [open, setOpen] = useState(false);

  // Notification dropdown
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Notification loading
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Notification ref
  const notificationRef = useRef(null);

  // Logged in user
  const user = JSON.parse(localStorage.getItem("user"));

  // Unread notification count
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Initial notification load
  useEffect(() => {
    loadNotifications();
  }, []);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Admin Socket Connected");

      socket.emit("join", user.id);
      socket.emit("join-admin");
    };

    // Receive new notification
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("connect", handleConnect);

    socket.on("new-notification", handleNotification);

    // If already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new-notification", handleNotification);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close notification dropdown
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      // Close profile dropdown
      if (open && !event.target.closest(".profile-dropdown")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    socket.disconnect();

    navigate("/login");
  };

  return (
    <header className="fixed left-72 right-0 top-0 z-40 h-20 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-end px-8">
        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <Bell size={21} />

              {/* Unread count */}
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <NotificationDropdown
                notifications={notifications}
                loading={loadingNotifications}
                unreadCount={unreadCount}
                refreshNotifications={loadNotifications}
                onNotificationClick={() => {
                  setNotificationOpen(false);
                }}
                onViewAll={() => {
                  setNotificationOpen(false);

                  navigate("/admin/notifications");
                }}
              />
            )}
          </div>

          {/* Profile */}
          <div className="relative profile-dropdown">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>

              {/* User Info */}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">
                  {user?.name || "Admin"}
                </p>

                <p className="mt-1 text-xs text-slate-500">Super Admin</p>
              </div>

              {/* Arrow */}
              <ChevronDown
                size={17}
                className={`text-slate-500 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {open && (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* User Information */}
                <div className="border-b border-slate-200 px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {user?.name || "Admin"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);

                    navigate("/admin/profile");
                  }}
                  className="w-full px-5 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Profile
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
