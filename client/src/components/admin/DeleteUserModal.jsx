import { useState } from "react";
import { X, Trash2, AlertTriangle, User } from "lucide-react";

const DeleteUserModal = ({ user, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      await onDelete(user._id);

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        {/* Header */}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-100 p-3">
              <Trash2 size={22} className="text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800">Delete User</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning */}

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 text-red-600" />

          <div>
            <p className="font-semibold text-red-700">
              This action cannot be undone.
            </p>

            <p className="mt-1 text-sm text-red-600">
              The selected user and all related data will be permanently
              removed.
            </p>
          </div>
        </div>

        {/* User */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white">
              <User size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">{user.name}</h3>

              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;