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
  Menu,
  X,
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const mobileLinkStyle = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile navigation after route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // Toggle notifications and mark them as read
  const handleToggleNotifications = async () => {
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
  };

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
    setShowMobileMenu(false);
    navigate("/notifications");
  };

  // Plan trip
  const handlePlanTripClick = () => {
    if (!token) {
      setShowMobileMenu(false);
      toast.error("Please login first to plan your trip");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    setShowMenu(false);
    setShowMobileMenu(false);
    navigate("/plan-trip");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    socket.disconnect();

    setShowMenu(false);
    setShowMobileMenu(false);

    navigate("/login");
  };

  const handleMobileNavigation = () => {
    setShowMobileMenu(false);
    setShowNotifications(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full max-w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-[1450px] min-w-0 items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleMobileNavigation}
          className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-gradient-to-br from-blue-100 via-sky-100 to-indigo-100 shadow-sm transition duration-200 group-hover:scale-105 sm:h-11 sm:w-11">
            <FaGlobeAsia className="text-[25px] text-blue-500 sm:text-[27px]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <FaHome className="text-[15px] text-white sm:text-[16px]" />
            </div>

            <FaPlaneDeparture className="absolute -right-1 -top-1 rounded-full bg-white p-[2px] text-[11px] text-indigo-600 shadow" />
          </div>

          <span className="text-lg font-extrabold tracking-tight text-blue-600 transition group-hover:text-indigo-600 sm:text-[23px]">
            TripPilot AI
          </span>
        </Link>

        {/* Desktop navigation: unchanged functionality */}
        <div className="hidden items-center gap-3 md:flex lg:gap-5">
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

          {!token ? (
            <div className="ml-2 flex items-center gap-3">
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
            <div className="ml-3 flex items-center gap-5 lg:ml-4 lg:gap-6">
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
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

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600 md:hidden"
          onClick={() => setShowMobileMenu((prev) => !prev)}
          aria-label={
            showMobileMenu ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={showMobileMenu}
        >
          {showMobileMenu ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile navigation menu */}
      {showMobileMenu && (
        <div className="w-full border-t border-gray-100 bg-white px-3 pb-4 pt-3 shadow-lg md:hidden sm:px-5">
          <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-1">
            <NavLink
              to="/"
              onClick={handleMobileNavigation}
              className={mobileLinkStyle}
            >
              <House size={19} />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/states"
              onClick={handleMobileNavigation}
              className={mobileLinkStyle}
            >
              <Map size={19} />
              <span>States</span>
            </NavLink>

            <NavLink
              to="/destinations"
              onClick={handleMobileNavigation}
              className={mobileLinkStyle}
            >
              <MapPinned size={19} />
              <span>Destinations</span>
            </NavLink>

            <button
              type="button"
              onClick={handlePlanTripClick}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                isPlanTripActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <Plane size={19} />
              <span>Plan My Trip</span>
            </button>

            <div className="my-2 border-t border-gray-100" />

            {!token ? (
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to="/login"
                  onClick={handleMobileNavigation}
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:bg-blue-50"
                    }`
                  }
                >
                  <LogIn size={17} />
                  <span>Login</span>
                </NavLink>

                <NavLink
                  to="/signup"
                  onClick={handleMobileNavigation}
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white transition ${
                      isActive
                        ? "bg-blue-700"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600"
                    }`
                  }
                >
                  <UserPlus size={17} />
                  <span>Signup</span>
                </NavLink>
              </div>
            ) : (
              <>
                {/* Mobile notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                  >
                    <span className="relative flex">
                      <Bell size={19} />
                      {unreadCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </span>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto text-xs text-gray-500">
                        {unreadCount} unread
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="relative mt-1 w-full">
                      <NotificationDropdown
                        notifications={notifications}
                        loading={loadingNotifications}
                        unreadCount={unreadCount}
                        onNotificationClick={handleNotificationClick}
                        onViewAll={handleViewAll}
                      />
                    </div>
                  )}
                </div>

                {/* Mobile profile and logout */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setShowMenu((prev) => !prev)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span>{user?.name || "My Profile"}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {showMenu ? "Close" : "Account"}
                    </span>
                  </button>

                  <ProfileDropdown
                    user={user}
                    show={showMenu}
                    onClose={() => setShowMenu(false)}
                    onPlanTrip={handlePlanTripClick}
                    onLogout={handleLogout}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
