import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { changePassword } from "../services/authService";

function Settings() {
  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Input change
  const handleChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Show toast
  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

  // Change password
  const handleChangePassword = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Check empty fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("error", "Please fill all password fields.");
      return;
    }

    // Check password length
    if (newPassword.length < 6) {
      showToast("error", "New password must be at least 6 characters long.");
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      showToast("error", "New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      // Call backend API
      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      // Success message
      showToast(
        "success",
        response.data.message || "Password changed successfully.",
      );

      // Clear fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("CHANGE PASSWORD ERROR:", error);

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div className="fixed left-1/2 top-6 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-xl">
          {toast.type === "success" ? (
            <CheckCircle size={22} className="shrink-0 text-green-600" />
          ) : (
            <XCircle size={22} className="shrink-0 text-red-600" />
          )}

          <p className="font-medium text-gray-800">{toast.message}</p>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Security section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            {/* Security heading */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LockKeyhole size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">Security</h1>

                <p className="mt-1 text-sm text-gray-500">
                  Change your account password to keep your account secure.
                </p>
              </div>
            </div>

            {/* Password form */}
            <form
              onSubmit={handleChangePassword}
              className="mt-8 max-w-xl space-y-5"
            >
              {/* Current password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Current Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password hint */}
              <p className="text-sm text-gray-500">
                Your new password must contain at least 6 characters.
              </p>

              {/* Submit button */}
              <div className="border-t border-gray-100 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
