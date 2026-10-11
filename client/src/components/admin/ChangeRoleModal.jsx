import { useState } from "react";
import { X, ShieldCheck, User, AlertTriangle } from "lucide-react";

const ChangeRoleModal = ({ user, onClose, onUpdateRole }) => {
  const [role, setRole] = useState(user?.role || "user");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await onUpdateRole(user._id, role);

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        {/* Header */}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-100 p-3">
              <ShieldCheck size={22} className="text-yellow-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Change User Role
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Information */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            User Information
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white">
              <User size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>

              <p className="text-sm text-slate-600">{user.email}</p>

              <p className="mt-1 text-xs text-slate-500">
                ID : {user._id.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Current Role */}

        <div className="mb-5">
          <label className="mb-2 block font-semibold text-slate-700">
            Current Role
          </label>

          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              user.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {user.role}
          </span>
        </div>

        {/* Select Role */}

        <div className="mb-5">
          <label className="mb-2 block font-semibold text-slate-700">
            Select New Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="user">User</option>

            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Warning only for Admin */}

        {role === "admin" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
            <AlertTriangle
              size={20}
              className="mt-0.5 flex-shrink-0 text-yellow-600"
            />

            <div>
              <p className="font-semibold text-yellow-800">
                Administrator Access
              </p>

              <p className="mt-1 text-sm leading-5 text-yellow-700">
                Admin users can manage users, destinations, attractions, trips,
                and all administrative settings. Assign this role only to
                trusted users.
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal;
