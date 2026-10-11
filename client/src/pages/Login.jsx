import { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { loginUser } from "../services/authService";
import api from "../services/api";
import { socket } from "../lib/socket";

function Login() {
  // Form data

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Show password

  const [showPassword, setShowPassword] = useState(false);

  // Google login loading

  const [googleLoading, setGoogleLoading] = useState(false);

  // Prevent Google callback from running twice

  const googleLoginProcessed = useRef(false);

  // Navigation

  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google callback

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const searchParams = new URLSearchParams(location.search);

      const googleToken = searchParams.get("googleToken");

      // If this is not a Google callback, do nothing

      if (!googleToken) {
        return;
      }

      // Prevent duplicate execution

      if (googleLoginProcessed.current) {
        return;
      }

      googleLoginProcessed.current = true;

      try {
        setGoogleLoading(true);

        // Save Google JWT token

        localStorage.setItem("token", googleToken);

        // Get logged-in user details

        const response = await api.get("/auth/profile");

        const user = response.data.user;

        // Save user

        localStorage.setItem("user", JSON.stringify(user));

        // Connect socket

        if (!socket.connected) {
          socket.connect();
        }

        // Join user room

        socket.emit("join", user._id || user.id);

        // Join admin room

        if (user.role === "admin") {
          socket.emit("join-admin");
        }

        // Remove Google token from URL

        window.history.replaceState({}, document.title, "/login");

        // Show success toast only once

        toast.success("Login successful", {
          id: "google-login-success",
          position: "top-center",
        });

        // Redirect to home

        navigate("/", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "GOOGLE LOGIN ERROR:",
          error.response?.data || error.message,
        );

        // Remove invalid token

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error(error.response?.data?.message || "Google login failed", {
          id: "google-login-error",
          position: "top-center",
        });

        navigate("/login", {
          replace: true,
        });
      } finally {
        setGoogleLoading(false);
      }
    };

    completeGoogleLogin();
  }, [location.search, navigate]);

  // Handle input change

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle normal login

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Save token

      localStorage.setItem("token", response.data.token);

      // Save user

      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Connect socket

      if (!socket.connected) {
        socket.connect();
      }

      // Join user room

      socket.emit("join", response.data.user._id || response.data.user.id);

      // Join admin room

      if (response.data.user.role === "admin") {
        socket.emit("join-admin");
      }

      // Success toast

      toast.success("Login successful", {
        id: "normal-login-success",
        position: "top-center",
      });

      // Redirect to home

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Login failed", {
        id: "normal-login-error",
        position: "top-center",
      });
    }
  };

  // Start Google login

  const handleGoogleLogin = () => {
    if (googleLoading) {
      return;
    }

    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {/* Heading */}

        <h2 className="mb-6 text-center text-2xl font-bold">Login</h2>

        {/* Login form */}

        <form onSubmit={handleSubmit}>
          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={googleLoading}
            className="mb-4 w-full rounded-md border p-3 disabled:cursor-not-allowed disabled:opacity-70"
            required
          />

          {/* Password */}

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={googleLoading}
              className="w-full rounded-md border p-3 pr-12 disabled:cursor-not-allowed disabled:opacity-70"
              required
            />

            <button
              type="button"
              disabled={googleLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot password */}

          <div className="mb-4 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}

          <button
            type="submit"
            disabled={googleLoading}
            className="w-full rounded-md bg-green-600 p-3 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Login
          </button>
        </form>

        {/* Divider */}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-sm text-gray-400">OR</span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google login */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white p-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
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

          {googleLoading
            ? "Completing Google login..."
            : "Continue with Google"}
        </button>

        {/* Signup */}

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
