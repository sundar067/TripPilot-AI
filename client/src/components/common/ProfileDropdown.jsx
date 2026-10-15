
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

const ProfileDropdown = ({
  user,
  show,
  onClose,
  onPlanTrip,
  onLogout,
}) => {
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
        fixed inset-x-3 top-[calc(env(safe-area-inset-top)+5rem)]
        z-[200] mx-auto flex w-auto max-w-sm flex-col
        overflow-hidden rounded-2xl border border-gray-200
        bg-white shadow-2xl
        md:absolute md:inset-x-auto md:right-0 md:top-full
        md:mx-0 md:mt-2 md:w-72 md:max-w-none
      "
      style={{
        maxHeight: "calc(100dvh - env(safe-area-inset-top) - 6rem)",
      }}
      role="menu"
      aria-label="Profile menu"
    >
      {/* User information */}
      <div className="shrink-0 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-5 sm:py-4">
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

      {/* Scrollable menu options */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]">
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

      {/* Logout always remains visible */}
      <div className="shrink-0 border-t border-gray-200 bg-white">
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-12 w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:text-base"
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
