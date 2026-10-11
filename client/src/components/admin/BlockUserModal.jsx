import { useState } from "react";
import { X, Ban, CheckCircle2 } from "lucide-react";

const BlockUserModal = ({ user, onClose, onToggle }) => {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await onToggle(user._id);

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = user.isBlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        {/* Header */}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-2xl p-3 ${
                isBlocked ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isBlocked ? (
                <CheckCircle2 size={22} className="text-green-600" />
              ) : (
                <Ban size={22} className="text-red-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              {isBlocked ? "Unblock User" : "Block User"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* User */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-semibold text-slate-800">{user.name}</p>

          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>

        {/* Message */}

        <div
          className={`mb-6 rounded-xl border p-4 ${
            isBlocked
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-sm leading-6 ${
              isBlocked ? "text-green-700" : "text-red-700"
            }`}
          >
            {isBlocked
              ? "This user will immediately regain access to their account after being unblocked."
              : "This user will no longer be able to sign in until the account is unblocked."}
          </p>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isBlocked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading
              ? "Please wait..."
              : isBlocked
                ? "Unblock User"
                : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal;
