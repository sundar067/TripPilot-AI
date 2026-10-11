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
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium">Logging you in...</p>
    </div>
  );
}

export default GoogleSuccess;
