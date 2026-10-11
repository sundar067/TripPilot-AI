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
  // Hide dropdown
  if (!show) return null;

  return (
    <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      {/* User Info */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* User Details */}
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

      {/* Menu */}
      <div className="py-2">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Plan My Trip */}
        <button
          type="button"
          onClick={onPlanTrip}
          className="flex w-full items-center gap-3 px-5 py-3 text-left text-gray-700 transition hover:bg-gray-100"
        >
          <Plane size={18} />
          Plan My Trip
        </button>

        {/* Wishlist */}
        <NavLink
          to="/wishlist"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          <Heart size={18} />
          Wishlist
        </NavLink>

        {/* Notifications */}
        <NavLink
          to="/notifications"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          <Bell size={18} />
          Notifications
        </NavLink>

        {/* My Profile */}
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          <User size={18} />
          My Profile
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>

      {/* Logout */}
      <div className="border-t">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-5 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
