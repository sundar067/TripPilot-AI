import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(token, password);

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gray-100 px-3 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-md sm:rounded-lg sm:p-8">
        {/* Heading */}
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 sm:text-2xl">
          Reset Password
        </h2>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="w-full min-w-0 rounded-md border border-gray-300 p-3 pr-12 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="w-full min-w-0 rounded-md border border-gray-300 p-3 pr-12 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={loading}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 p-3 font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 break-words text-center text-sm leading-6 text-blue-600"
          >
            {message}
          </p>
        )}

        {/* Login Link */}
        <p className="mt-4 text-center text-sm sm:text-base">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
