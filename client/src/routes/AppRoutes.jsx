import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// User Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import Dashboard from "../pages/Dashboard";
import TripDetails from "../pages/TripDetails";
import Notifications from "../pages/Notifications";
import Wishlist from "../pages/Wishlist";
import UserProfile from "../pages/Profile";
import Settings from "../pages/Settings";

import States from "../pages/States";
import StateDetails from "../pages/StateDetails";

import Destinations from "../pages/Destinations";
import DestinationDetails from "../pages/DestinationDetails";
import NearbyPlaceDetails from "../pages/NearbyPlaceDetails";
import AttractionDetails from "../pages/AttractionDetails";

import PlanTrip from "../pages/PlanTrip";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";

import ManageStates from "../pages/admin/ManageStates";
import AddState from "../pages/admin/AddState";
import EditState from "../pages/admin/EditState";

import ManageDestinations from "../pages/admin/ManageDestinations";
import AddDestination from "../pages/admin/AddDestination";
import EditDestination from "../pages/admin/EditDestination";

import ManageAttractions from "../pages/admin/ManageAttractions";
import AddAttraction from "../pages/admin/AddAttraction";
import EditAttraction from "../pages/admin/EditAttraction";

import ManageUsers from "../pages/admin/ManageUsers";
import Profile from "../pages/admin/Profile";

// Admin Security
import SecuritySettings from "../components/admin/settings/SecuritySettings";

// Route Protection
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Admin Layout
import AdminLayout from "../components/admin/AdminLayout";

function AppRoutes() {
  const location = useLocation();

  // Hide normal navbar and footer on admin pages
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* States */}
        <Route path="/states" element={<States />} />
        <Route path="/states/:id" element={<StateDetails />} />

        {/* Destinations */}
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />

        {/* Nearby Places */}
        <Route
          path="/destination/:id/nearby/:placeIndex"
          element={<NearbyPlaceDetails />}
        />

        {/* Attractions */}
        <Route path="/attraction/:id" element={<AttractionDetails />} />

        {/* AI Trip Planner */}
        <Route path="/plan-trip" element={<PlanTrip />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Manage States */}
          <Route path="states" element={<ManageStates />} />
          <Route path="states/add" element={<AddState />} />
          <Route path="states/edit/:id" element={<EditState />} />

          {/* Manage Destinations */}
          <Route path="destinations" element={<ManageDestinations />} />
          <Route path="destinations/add" element={<AddDestination />} />
          <Route path="destinations/edit/:id" element={<EditDestination />} />

          {/* Manage Attractions */}
          <Route path="attractions" element={<ManageAttractions />} />
          <Route path="attractions/add" element={<AddAttraction />} />
          <Route path="attractions/edit/:id" element={<EditAttraction />} />

          {/* Users */}
          <Route path="users" element={<ManageUsers />} />

          {/* Admin Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Admin Notifications */}
          <Route path="notifications" element={<Notifications />} />

          {/* Admin Security */}
          <Route path="security" element={<SecuritySettings />} />
        </Route>
      </Routes>

      {/* Footer on all non-admin pages */}
      {!isAdminPage && <Footer />}
    </>
  );
}

export default AppRoutes;
