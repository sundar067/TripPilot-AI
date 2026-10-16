import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { registerUser } from "../services/authService";

function Signup() {
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  // Google loading state
  const [googleLoading, setGoogleLoading] = useState(false);

  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);

  // Show / hide confirm password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Navigation
  const navigate = useNavigate();

  // Input fields update
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Signup form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all fields", {
        position: "top-center",
      });

      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup Success:", response.data);

      toast.success("Account created successfully!", {
        position: "top-center",
      });

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(
        "Signup Error:",
        error.response?.data || error.message
      );

      toast.error(error.response?.data?.message || "Signup failed", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  // Start Google signup
  const handleGoogleSignup = () => {
    if (googleLoading) {
      return;
    }

    setGoogleLoading(true);

    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gray-100 px-3 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-md sm:p-8">
        {/* Heading */}
        <h2 className="mb-5 text-center text-2xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
          Create Account
        </h2>

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading || googleLoading}
            autoComplete="name"
            className="mb-4 w-full min-w-0 rounded-md border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || googleLoading}
            autoComplete="email"
            className="mb-4 w-full min-w-0 rounded-md border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />

          {/* Password */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || googleLoading}
              autoComplete="new-password"
              className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-3 pr-12 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || googleLoading}
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
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || googleLoading}
              autoComplete="new-password"
              className="w-full min-w-0 rounded-md border border-gray-300 px-4 py-3 pr-12 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={loading || googleLoading}
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

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3 sm:my-6">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="shrink-0 text-sm text-gray-400">OR</span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:gap-3 sm:text-base"
        >
          {/* Google Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="shrink-0"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.78h3.14c1.84-1.69 2.92-4.18 2.92-7.74Z"
            />

            <path
              fill="#34A853"
              d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.78c-.87.58-1.98.92-3.29.92-2.53 0-4.67-1.71-5.44-4v2.87H3.32v2.87A9.72 9.72 0 0 0 12 21.75Z"
            />

            <path
              fill="#FBBC05"
              d="M6.56 13.53A5.86 5.86 0 0 1 6.25 12c0-.53.09-1.04.31-1.53V7.6H3.32A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.07 4.4l3.24-2.87Z"
            />

            <path
              fill="#EA4335"
              d="M12 6.47c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.81 3.54 14.62 2.25 12 2.25A9.72 9.72 0 0 0 3.32 7.6l3.24 2.87c.77-2.29 2.91-4 5.44-4Z"
            />
          </svg>

          <span className="min-w-0 text-center">
            {googleLoading
              ? "Redirecting to Google..."
              : "Continue with Google"}
          </span>
        </button>

        {/* Login Link */}
        <p className="mt-5 text-center text-sm leading-6 text-gray-600 sm:mt-6 sm:text-base">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
