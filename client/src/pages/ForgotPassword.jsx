import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await forgotPassword(email);

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gray-100 px-3 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-md sm:rounded-2xl sm:p-8">
        <h2 className="mb-5 text-center text-xl font-bold sm:mb-6 sm:text-2xl">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 block w-full min-w-0 rounded-md border border-gray-300 p-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 p-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 break-words text-center text-sm text-green-600">
            {message}
          </p>
        )}

        <p className="mt-4 text-center text-sm sm:text-base">
          <Link
            to="/login"
            className="text-blue-600 transition hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
