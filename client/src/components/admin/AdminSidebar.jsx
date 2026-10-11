import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Map,
  MapPin,
  Star,
  Users,
  Plane,
  User,
  Shield,
} from "lucide-react";

const AdminSidebar = () => {
  // Main navigation
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "States",
      path: "/admin/states",
      icon: Map,
    },
    {
      name: "Destinations",
      path: "/admin/destinations",
      icon: MapPin,
    },
    {
      name: "Attractions",
      path: "/admin/attractions",
      icon: Star,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
  ];

  // Account navigation
  const accountItems = [
    {
      name: "My Profile",
      path: "/admin/profile",
      icon: User,
    },
    {
      name: "Security",
      path: "/admin/security",
      icon: Shield,
    },
  ];

  // Common navigation item
  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.name}
        to={item.path}
        className={({ isActive }) =>
          `group relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
            isActive
              ? "border border-cyan-200 bg-cyan-50 text-cyan-600 shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Active indicator */}
            {isActive && (
              <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-cyan-500" />
            )}

            {/* Icon */}
            <Icon
              size={20}
              strokeWidth={isActive ? 2.3 : 2}
              className={
                isActive
                  ? "text-cyan-600"
                  : "text-slate-500 transition-colors group-hover:text-slate-800"
              }
            />

            {/* Navigation name */}
            <span className="text-[15px] font-medium">{item.name}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="shrink-0 border-b border-slate-200 px-6 py-6">
        <div className="flex items-center gap-4">
          {/* Logo icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Plane size={27} strokeWidth={2.2} className="text-white" />
          </div>

          {/* Logo text */}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              TripPilot AI
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-5">
        {/* Navigation heading */}
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Navigation
        </p>

        {/* Main navigation */}
        <nav className="space-y-1.5">{menuItems.map(renderNavItem)}</nav>

        {/* Separator */}
        <div className="my-5 border-t border-slate-100" />

        {/* Account heading */}
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Account
        </p>

        {/* Account navigation */}
        <nav className="space-y-1.5">{accountItems.map(renderNavItem)}</nav>
      </div>

      {/* Footer */}
      <div className="relative shrink-0 overflow-hidden border-t border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50/60 px-5 py-5">
        {/* Subtle mountain background */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 h-32 w-full opacity-20"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Back mountain */}
          <path
            d="M0 140L70 75L115 112L175 48L245 112L300 68L400 140Z"
            fill="#bae6fd"
          />

          {/* Front mountain */}
          <path
            d="M0 140L85 95L135 120L205 65L270 118L330 88L400 140Z"
            fill="#67e8f9"
          />

          {/* Snow peak */}
          <path
            d="M175 48L205 78L195 70L185 82L175 72L165 82L155 72Z"
            fill="#ffffff"
          />

          {/* Small snow peak */}
          <path d="M70 75L90 95L82 89L75 96L68 88L60 95Z" fill="#ffffff" />
        </svg>

        {/* Footer card */}
        <div className="relative z-10 rounded-xl border border-slate-100 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm">
          {/* Brand */}
          <div className="flex items-center gap-3">
            {/* Small logo */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 shadow-sm">
              <Plane size={17} strokeWidth={2.2} className="text-white" />
            </div>

            {/* Brand text */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                TripPilot AI Admin
              </p>

              <p className="mt-0.5 text-xs text-slate-400">Version 1.1.0</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-[11px] text-slate-400">
              © 2026 TripPilot AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
