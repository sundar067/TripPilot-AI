import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  Search,
  Eye,
  Trash2,
  ShieldCheck,
  User,
  Ban,
  CheckCircle2,
  Users as UsersIcon,
  UserCheck,
  ShieldAlert,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getAllUsers,
  getUserDetails,
  changeUserRole,
  deleteUser,
  toggleUserBlock,
} from "../../services/userService";

import UserDetailsModal from "../../components/admin/UserDetailsModal";
import ChangeRoleModal from "../../components/admin/ChangeRoleModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";
import BlockUserModal from "../../components/admin/BlockUserModal";

const PAGE_SIZE = 5;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  const [roleUser, setRoleUser] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [blockModalUser, setBlockModalUser] = useState(null);

  // Fetch Users

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();

      setUsers(data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // View User

  const handleViewUser = async (id) => {
    setIsUserModalOpen(true);
    setUserDetailsLoading(true);
    setSelectedUser(null);

    try {
      const user = await getUserDetails(id);

      setSelectedUser(user);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch user details.",
      );

      setIsUserModalOpen(false);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  // Change Role

  const handleUpdateRole = async (id, role) => {
    try {
      const res = await changeUserRole(id, role);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id
            ? {
                ...user,
                role,
              }
            : user,
        ),
      );

      toast.success(res.message || "User role updated successfully.");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to update role.");
    }
  };

  // Block / Unblock

  const handleToggleBlock = async (id) => {
    try {
      const res = await toggleUserBlock(id);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id
            ? {
                ...user,
                isBlocked: !user.isBlocked,
              }
            : user,
        ),
      );

      toast.success(res.message || "User status updated successfully.");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to update user status.",
      );
    }
  };

  // Delete User

  const handleDeleteUser = async (id) => {
    try {
      const res = await deleteUser(id);

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));

      toast.success(res.message || "User deleted successfully.");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  // Reset Filters

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  // Card Filter

  const applyCardFilter = (nextRoleFilter, nextStatusFilter) => {
    setRoleFilter((prevRole) =>
      prevRole === nextRoleFilter && statusFilter === nextStatusFilter
        ? "all"
        : nextRoleFilter,
    );

    setStatusFilter((prevStatus) =>
      roleFilter === nextRoleFilter && prevStatus === nextStatusFilter
        ? "all"
        : nextStatusFilter,
    );

    setPage(1);
  };

  // Stats

  const stats = useMemo(() => {
    const total = users.length;

    const active = users.filter((user) => !user.isBlocked).length;

    const admins = users.filter(
      (user) => user.isSuperAdmin || user.role === "admin",
    ).length;

    const blocked = users.filter((user) => user.isBlocked).length;

    return {
      total,
      active,
      admins,
      blocked,
    };
  }, [users]);

  // Active Filters

  const hasActiveFilters =
    search.trim() !== "" || roleFilter !== "all" || statusFilter !== "all";

  // Active Card

  const activeCard =
    roleFilter === "all" && statusFilter === "all"
      ? "total"
      : roleFilter === "all" && statusFilter === "active"
        ? "active"
        : roleFilter === "admin" && statusFilter === "all"
          ? "admins"
          : roleFilter === "all" && statusFilter === "blocked"
            ? "blocked"
            : null;

  // Search + Filters

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "super_admin"
            ? user.isSuperAdmin
            : roleFilter === "admin"
              ? user.isSuperAdmin || user.role === "admin"
              : !user.isSuperAdmin && user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? !user.isBlocked
            : user.isBlocked;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Pagination

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const startEntry =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endEntry = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

  const pageNumbers = useMemo(() => {
    const pages = [];

    pages.push(1);

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Loader

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

          <h2 className="text-xl font-semibold text-slate-800">
            Loading Users...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Heading */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage all users and their access
        </p>
      </div>

      {/* Stat Cards */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<UsersIcon size={22} />}
          iconBg="bg-blue-500"
          label="Total Users"
          value={stats.total}
          hint="All registered users"
          active={activeCard === "total"}
          onClick={() => applyCardFilter("all", "all")}
        />

        <StatCard
          icon={<UserCheck size={22} />}
          iconBg="bg-emerald-500"
          label="Active Users"
          value={stats.active}
          hint="Currently active"
          active={activeCard === "active"}
          onClick={() => applyCardFilter("all", "active")}
        />

        <StatCard
          icon={<ShieldAlert size={22} />}
          iconBg="bg-amber-500"
          label="Admins"
          value={stats.admins}
          hint="Admin accounts"
          active={activeCard === "admins"}
          onClick={() => applyCardFilter("admin", "all")}
        />

        <StatCard
          icon={<Ban size={22} />}
          iconBg="bg-red-500"
          label="Blocked Users"
          value={stats.blocked}
          hint="Currently blocked"
          active={activeCard === "blocked"}
          onClick={() => applyCardFilter("all", "blocked")}
        />
      </div>

      {/* Main Card */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Search + Filters */}

        <div className="flex flex-col gap-3 p-6 pb-4 lg:flex-row lg:items-center">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          {/* Filters */}

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All Roles</option>

              <option value="super_admin">Super Admin</option>

              <option value="admin">Admin</option>

              <option value="user">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="blocked">Blocked</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm transition-colors ${
                hasActiveFilters
                  ? "cursor-pointer border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                  : "cursor-not-allowed border-slate-200 bg-white text-slate-400"
              }`}
            >
              <SlidersHorizontal size={16} />

              {hasActiveFilters ? "Clear Filters" : "Filters"}
            </button>
          </div>
        </div>

        {/* Table */}

        <div className="border-t border-slate-100">
          {/* Header */}

          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
            <div className="basis-[26%] min-w-0">User</div>

            <div className="basis-[24%] min-w-0">Email</div>

            <div className="basis-[12%] min-w-0">Role</div>

            <div className="basis-[12%] min-w-0">Status</div>

            <div className="basis-[10%] min-w-0">Joined</div>

            <div className="basis-[16%] min-w-0 shrink-0 text-right">
              Actions
            </div>
          </div>

          {/* Body */}

          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-2 border-b border-slate-100 px-6 py-5 transition-colors duration-150 ${
                  user.isBlocked
                    ? "bg-red-50/50 hover:bg-red-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                {/* User */}

                <div className="flex basis-[26%] min-w-0 items-center gap-3 pr-2">
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                      user.isSuperAdmin
                        ? "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500"
                        : "bg-cyan-500"
                    }`}
                  >
                    {user.isSuperAdmin ? (
                      <ShieldCheck size={18} strokeWidth={2.5} />
                    ) : (
                      <User size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold text-slate-800">
                        {user.name}
                      </h3>

                      {user.isSuperAdmin && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          Owner
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      #{user._id.slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Email */}

                <div className="basis-[24%] min-w-0 truncate pr-2 text-sm text-slate-700">
                  {user.email}
                </div>

                {/* Role */}

                <div className="basis-[12%] min-w-0 pr-2">
                  {user.isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <ShieldCheck size={12} strokeWidth={2.5} />
                      Super Admin
                    </span>
                  ) : (
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                        user.role === "admin"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </div>

                {/* Status */}

                <div className="basis-[12%] min-w-0 pr-2">
                  {user.isBlocked ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                      <Ban size={12} />
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={12} />
                      Active
                    </span>
                  )}
                </div>

                {/* Joined */}

                <div className="basis-[10%] min-w-0 truncate pr-2 text-sm text-slate-600">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </div>

                {/* Actions */}

                <div className="flex basis-[16%] min-w-0 shrink-0 items-center justify-end gap-2">
                  {/* View */}

                  <button
                    type="button"
                    title="View User"
                    onClick={() => handleViewUser(user._id)}
                    className="rounded-xl bg-blue-500 p-2.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg"
                  >
                    <Eye size={16} />
                  </button>

                  {/* Super Admin Cannot Be Modified */}

                  {!user.isSuperAdmin && (
                    <>
                      {/* Change Role */}

                      <button
                        type="button"
                        title="Change Role"
                        onClick={() => setRoleUser(user)}
                        className="rounded-xl bg-yellow-500 p-2.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-600 hover:shadow-lg"
                      >
                        <ShieldCheck size={16} />
                      </button>

                      {/* Block / Unblock */}

                      <button
                        type="button"
                        title={user.isBlocked ? "Unblock User" : "Block User"}
                        onClick={() => setBlockModalUser(user)}
                        className={`rounded-xl p-2.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                          user.isBlocked
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                      >
                        {user.isBlocked ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Ban size={16} />
                        )}
                      </button>

                      {/* Delete */}

                      <button
                        type="button"
                        title="Delete User"
                        onClick={() => setDeleteModalUser(user)}
                        className="rounded-xl bg-red-500 p-2.5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-500">
              No users found.
            </div>
          )}
        </div>

        {/* Pagination */}

        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {filteredUsers.length === 0
              ? "No users to show"
              : `Showing ${startEntry} to ${endEntry} of ${filteredUsers.length} users`}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((p, index) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      p === currentPage
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={`${p}-${index}`}
                    className="flex h-9 w-9 items-center justify-center text-slate-400"
                  >
                    ...
                  </span>
                ),
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}

      {isUserModalOpen && (
        <UserDetailsModal
          user={selectedUser}
          isLoading={userDetailsLoading}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Change Role Modal */}

      {roleUser && (
        <ChangeRoleModal
          user={roleUser}
          onClose={() => setRoleUser(null)}
          onUpdateRole={handleUpdateRole}
        />
      )}

      {/* Block / Unblock Modal */}

      {blockModalUser && (
        <BlockUserModal
          user={blockModalUser}
          onClose={() => setBlockModalUser(null)}
          onToggle={handleToggleBlock}
        />
      )}

      {/* Delete Modal */}

      {deleteModalUser && (
        <DeleteUserModal
          user={deleteModalUser}
          onClose={() => setDeleteModalUser(null)}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
};

/* =========================================================
   USER STAT CARD
========================================================= */

const StatCard = ({ icon, iconBg, label, value, hint, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200 ${
      active
        ? "border-cyan-400 bg-cyan-50 shadow-md ring-1 ring-cyan-300"
        : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
    }`}
  >
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm ${iconBg}`}
    >
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="text-2xl font-bold text-slate-900">{value}</p>

      <p className="truncate text-xs text-slate-400">{hint}</p>
    </div>
  </button>
);

export default ManageUsers;
