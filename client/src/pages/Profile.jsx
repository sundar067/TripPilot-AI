import { useState } from "react";
import { User, Mail, Save, CheckCircle } from "lucide-react";

import { updateProfile } from "../services/authService";

function Profile() {
  // Get logged-in user
  const getLoggedInUser = () => {
    const keys = ["user", "tripPilotUser", "authUser", "userInfo"];

    for (const key of keys) {
      const data = localStorage.getItem(key);

      if (!data) continue;

      try {
        const userData = JSON.parse(data);
        const user = userData?.user || userData;

        if (user?._id || user?.id) {
          return user;
        }
      } catch (error) {
        console.log(error);
      }
    }

    return null;
  };

  const loggedInUser = getLoggedInUser();

  // Profile data
  const [profileData, setProfileData] = useState({
    name: loggedInUser?.name || "",
    email: loggedInUser?.email || "",
  });

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Error message
  const [errorMessage, setErrorMessage] = useState("");

  // Loading state
  const [saving, setSaving] = useState(false);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfileData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear old error
    setErrorMessage("");
  };

  // Save profile changes
  const handleSave = async () => {
    // Check fields
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setErrorMessage("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      // Update profile in MongoDB
      const response = await updateProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });

      const updatedUser = response.data.user;

      // Update localStorage
      const keys = ["user", "tripPilotUser", "authUser", "userInfo"];

      for (const key of keys) {
        const data = localStorage.getItem(key);

        if (!data) continue;

        try {
          const parsedData = JSON.parse(data);

          // User stored inside another object
          if (parsedData?.user) {
            localStorage.setItem(
              key,
              JSON.stringify({
                ...parsedData,
                user: {
                  ...parsedData.user,
                  ...updatedUser,
                },
              }),
            );
          } else {
            localStorage.setItem(
              key,
              JSON.stringify({
                ...parsedData,
                ...updatedUser,
              }),
            );
          }
        } catch (error) {
          console.log(error);
        }
      }

      // Update form data
      setProfileData({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      // Show success toast
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.log(error.response?.data || error.message);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // User first letter
  const userInitial = profileData.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      {/* Success Toast */}
      {showToast && (
        <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-green-200 bg-white px-6 py-4 shadow-xl">
          <CheckCircle size={22} className="text-green-600" />

          <div>
            <p className="font-semibold text-gray-800">
              Profile updated successfully
            </p>

            <p className="text-sm text-gray-500">
              Your changes have been saved.
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-7 py-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

            <p className="mt-2 text-gray-500">
              Manage your account information.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* User profile card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-4xl font-bold text-white">
                  {userInitial}

                  {/* Online indicator */}
                  <span className="absolute bottom-2 left-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                </div>

                {/* User name */}
                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                  {profileData.name || "User"}
                </h2>

                {/* User email */}
                <p className="mt-2 text-sm text-gray-500">
                  {profileData.email || "No email"}
                </p>
              </div>
            </div>

            {/* Profile information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile Information
              </h2>

              <p className="mt-1 text-gray-500">Edit your personal details.</p>

              {/* Error message */}
              {errorMessage && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="mt-8 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
