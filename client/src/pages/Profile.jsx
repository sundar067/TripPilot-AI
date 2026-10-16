
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

    setErrorMessage("");
  };

  // Save profile changes
  const handleSave = async () => {
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setErrorMessage("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

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
        <div className="fixed inset-x-3 top-3 z-50 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-xl sm:inset-x-auto sm:top-6 sm:px-6 sm:py-4">
          <CheckCircle
            size={22}
            className="shrink-0 text-green-600"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 sm:text-base">
              Profile updated successfully
            </p>

            <p className="text-xs text-gray-500 sm:text-sm">
              Your changes have been saved.
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full min-w-0 bg-gray-50 px-4 py-5 sm:px-6 sm:py-8 md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Page heading */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:mb-6 sm:px-7 sm:py-6">
            <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:text-base">
              Manage your account information.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            {/* User profile card */}
            <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-3xl font-bold text-white sm:h-32 sm:w-32 sm:text-4xl">
                  {userInitial}

                  {/* Online indicator */}
                  <span className="absolute bottom-1.5 left-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 sm:bottom-2 sm:h-4 sm:w-4" />
                </div>

                {/* User name */}
                <h2 className="mt-4 max-w-full break-words text-xl font-bold text-gray-900 sm:mt-6 sm:text-2xl">
                  {profileData.name || "User"}
                </h2>

                {/* User email */}
                <p className="mt-2 max-w-full break-all text-sm text-gray-500">
                  {profileData.email || "No email"}
                </p>
              </div>
            </div>

            {/* Profile information */}
            <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-7">
              <h2 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                Profile Information
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-gray-500 sm:text-base">
                Edit your personal details.
              </p>

              {/* Error message */}
              {errorMessage && (
                <div className="mt-5 break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
                {/* Full Name */}
                <div className="min-w-0">
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={19}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4"
                    />

                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="box-border min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-base text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:py-4 sm:pl-12 sm:pr-4"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="min-w-0">
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4"
                    />

                    <input
                      id="profile-email"
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="box-border min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-base text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:py-4 sm:pl-12 sm:pr-4"
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-6 border-t border-gray-100 pt-5 sm:mt-8 sm:pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:text-base"
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
