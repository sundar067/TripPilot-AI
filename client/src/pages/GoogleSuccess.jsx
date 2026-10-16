import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function GoogleSuccess() {
  // Navigation
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // Check token
    if (!token) {
      toast.error("Google login failed");
      navigate("/login");
      return;
    }

    // Save token
    localStorage.setItem("token", token);

    // Get user profile
    const getUserProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        // Save user
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));

          toast.success("Google login successful");

          navigate("/");
        } else {
          toast.error("Unable to get user information");
          navigate("/login");
        }
      } catch (error) {
        console.error(error);

        toast.error("Google login failed");
        navigate("/login");
      }
    };

    getUserProfile();
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-md sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent sm:h-12 sm:w-12" />
        </div>

        <h1 className="mt-4 break-words text-xl font-bold text-gray-900 sm:mt-5 sm:text-2xl">
          Logging you in...
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
          Please wait while we complete your Google sign-in.
        </p>
      </div>
    </div>
  );
}

export default GoogleSuccess;
