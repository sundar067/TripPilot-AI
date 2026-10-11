import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="ml-72 min-h-screen">
        {/* Top Navbar */}
        <AdminNavbar />

        {/* Main Content */}
        <main className="min-h-screen bg-white px-8 pb-8 pt-24">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
