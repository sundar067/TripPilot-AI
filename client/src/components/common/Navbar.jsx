import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { FaPlaneDeparture, FaHome, FaGlobeAsia } from "react-icons/fa";

import {
  Bell,
  House,
  Map,
  MapPinned,
  Plane,
  LogIn,
  UserPlus,
} from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import { socket } from "../../lib/socket";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const [showMenu, setShowMenu] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef(null);

  const profileRef = useRef(null);

  const isHomeActive = location.pathname === "/";

  const isPlanTripActive = location.pathname === "/plan-trip";

  const navStyle = ({ isActive }) =>
    `group flex min-w-[70px] flex-col items-center justify-center gap-1 px-2 py-1 transition ${
      isActive
        ? "font-semibold text-blue-600"
        : "font-medium text-gray-700 hover:text-blue-600"
    }`;

  const navIconStyle = (isActive) =>
    `transition ${
      isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
    }`;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setLoadingNotifications(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Socket connection
  useEffect(() => {
    if (!token || !user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("🟢 Socket Connected");

      socket.emit("join", user.id);

      if (user.role === "admin") {
        socket.emit("join-admin");
      }
    };

    const handleNotification = (notification) => {
      console.log("🔔 Realtime Notification:", notification);

      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("connect", handleConnect);

    socket.on("new-notification", handleNotification);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);

      socket.off("new-notification", handleNotification);
    };
  }, [token, user]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // Notification click
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // View all notifications
  const handleViewAll = () => {
    setShowNotifications(false);

    navigate("/notifications");
  };

  // Plan trip
  const handlePlanTripClick = () => {
    if (!token) {
      toast.error("Please login first to plan your trip");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    setShowMenu(false);

    navigate("/plan-trip");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    socket.disconnect();

    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1450px] items-center justify-between px-4 py-2.5 sm:px-5">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-gradient-to-br from-blue-100 via-sky-100 to-indigo-100 shadow-sm transition duration-200 group-hover:scale-105">
            <FaGlobeAsia className="text-[27px] text-blue-500" />

            <div className="absolute inset-0 flex items-center justify-center">
              <FaHome className="text-[16px] text-white" />
            </div>

            <FaPlaneDeparture className="absolute -right-1 -top-1 rounded-full bg-white p-[2px] text-[11px] text-indigo-600 shadow" />
          </div>

          <span className="text-[23px] font-extrabold tracking-tight text-blue-600 transition group-hover:text-indigo-600">
            TripPilot AI
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Home */}
          <NavLink
            to="/"
            className={() =>
              `group flex min-w-[70px] flex-col items-center justify-center gap-1 px-2 py-1 transition ${
                isHomeActive
                  ? "font-semibold text-blue-600"
                  : "font-medium text-gray-700 hover:text-blue-600"
              }`
            }
          >
            <House
              size={20}
              strokeWidth={2}
              className={navIconStyle(isHomeActive)}
            />

            <span className="text-[13px]">Home</span>
          </NavLink>

          {/* States */}
          <NavLink to="/states" className={navStyle}>
            {({ isActive }) => (
              <>
                <Map
                  size={20}
                  strokeWidth={2}
                  className={navIconStyle(isActive)}
                />

                <span className="text-[13px]">States</span>
              </>
            )}
          </NavLink>

          {/* Destinations */}
          <NavLink to="/destinations" className={navStyle}>
            {({ isActive }) => (
              <>
                <MapPinned
                  size={20}
                  strokeWidth={2}
                  className={navIconStyle(isActive)}
                />

                <span className="text-[13px]">Destinations</span>
              </>
            )}
          </NavLink>

          {/* Plan My Trip */}
          <button
            type="button"
            onClick={handlePlanTripClick}
            className={`group flex min-w-[90px] flex-col items-center justify-center gap-1 px-2 py-1 transition ${
              isPlanTripActive
                ? "font-semibold text-blue-600"
                : "font-medium text-gray-700 hover:text-blue-600"
            }`}
          >
            <Plane
              size={20}
              strokeWidth={2}
              className={navIconStyle(isPlanTripActive)}
            />

            <span className="text-[13px]">Plan My Trip</span>
          </button>

          {/* Logged out */}
          {!token ? (
            <div className="ml-2 flex items-center gap-3">
              {/* Login Button */}
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition duration-200 ${
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                <LogIn size={17} />

                <span>Login</span>
              </NavLink>

              {/* Signup Button */}
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 ${
                    isActive
                      ? "bg-blue-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-[1px] hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
                  }`
                }
              >
                <UserPlus size={17} />

                <span>Signup</span>
              </NavLink>
            </div>
          ) : (
            <div className="ml-3 flex items-center gap-5 sm:ml-4 sm:gap-6">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={async () => {
                    setShowNotifications((prev) => !prev);

                    if (unreadCount > 0) {
                      try {
                        await markAllNotificationsAsRead();

                        setNotifications((prev) =>
                          prev.map((item) => ({
                            ...item,
                            isRead: true,
                          })),
                        );
                      } catch (error) {
                        console.error(error);
                      }
                    }
                  }}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-blue-50"
                  aria-label="Notifications"
                >
                  <Bell
                    size={21}
                    strokeWidth={2}
                    className="text-gray-700 transition group-hover:text-blue-600"
                  />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationDropdown
                    notifications={notifications}
                    loading={loadingNotifications}
                    unreadCount={unreadCount}
                    onNotificationClick={handleNotificationClick}
                    onViewAll={handleViewAll}
                  />
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                  aria-label="Profile menu"
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </button>

                <ProfileDropdown
                  user={user}
                  show={showMenu}
                  onClose={() => setShowMenu(false)}
                  onPlanTrip={handlePlanTripClick}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
