import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Plane,
  LogOut,
  User,
  Heart,
  Bell,
  Settings,
} from "lucide-react";

const ProfileDropdown = ({ user, show, onClose, onPlanTrip, onLogout }) => {
  if (!show) return null;

  const linkClass = ({ isActive }) =>
    `flex w-full shrink-0 items-center gap-3 px-5 py-3 text-sm sm:text-base transition ${
      isActive
        ? "bg-blue-50 font-medium text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div
      className="
        fixed right-3 top-20 z-[200]
        w-[min(18rem,calc(100vw-1.5rem))]
        max-h-[70vh] overflow-y-auto overscroll-contain
        rounded-2xl border border-gray-200 bg-white shadow-2xl
        [scrollbar-width:thin]
        md:absolute md:right-0 md:top-full md:z-[100]
        md:mt-2 md:max-h-[calc(100dvh-8rem)]
      "
      role="menu"
      aria-label="Profile menu"
    >
      {/* User Info */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-800">
              {user?.name || "User"}
            </p>

            <p className="truncate text-sm text-gray-500">
              {user?.email || "No Email"}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="py-2">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={linkClass}
          role="menuitem"
        >
          <LayoutDashboard size={19} className="shrink-0" />
          <span>Dashboard</span>
        </NavLink>

        <button
          type="button"
          onClick={onPlanTrip}
          className="flex w-full shrink-0 items-center gap-3 px-5 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-100 sm:text-base"
          role="menuitem"
        >
          <Plane size={19} className="shrink-0" />
          <span>Plan My Trip</span>
        </button>

        <NavLink
          to="/wishlist"
          onClick={onClose}
          className={linkClass}
          role="menuitem"
        >
          <Heart size={19} className="shrink-0" />
          <span>Wishlist</span>
        </NavLink>

        <NavLink
          to="/notifications"
          onClick={onClose}
          className={linkClass}
          role="menuitem"
        >
          <Bell size={19} className="shrink-0" />
          <span>Notifications</span>
        </NavLink>

        <NavLink
          to="/profile"
          onClick={onClose}
          className={linkClass}
          role="menuitem"
        >
          <User size={19} className="shrink-0" />
          <span>My Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={linkClass}
          role="menuitem"
        >
          <Settings size={19} className="shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>

      {/* Logout stays accessible at the bottom of the scrollable menu */}
      <div className="shrink-0 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:text-base"
          role="menuitem"
        >
          <LogOut size={19} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
