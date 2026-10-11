import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const storedUser = localStorage.getItem("user");

  // User login nahi hai
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    console.log("Invalid user data:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return <Navigate to="/login" replace />;
  }

  // Admin nahi hai
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin hai
  return children;
}

export default AdminRoute;
