import { useEffect, useMemo, useState } from "react";
import { User, Mail, Save, Camera, ShieldCheck } from "lucide-react";

import { getProfile, updateProfile } from "../../services/adminService";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "Admin",
    avatar: "",
  });

  // Inline Status Message

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3000);
  };

  // Avatar Letter

  const avatarLetter = useMemo(() => {
    if (!profile.name) return "A";

    return profile.name.charAt(0).toUpperCase();
  }, [profile.name]);

  // Load Profile

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();

      setProfile({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "Admin",
        avatar: data.avatar || "",
      });
    } catch (error) {
      console.log("Profile Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save Profile

  const handleProfileUpdate = async () => {
    try {
      setSavingProfile(true);

      await updateProfile({
        name: profile.name,
        email: profile.email,
      });

      const user = JSON.parse(localStorage.getItem("user"));

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: profile.name,
          email: profile.email,
        }),
      );

      window.dispatchEvent(new Event("profileUpdated"));

      showMessage("success", "Profile updated successfully.");
    } catch (error) {
      console.log("Profile Update Error:", error);

      showMessage("error", "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Loading Screen

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
        {/* Badge */}

        <span className="inline-block rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1 text-xs font-medium text-cyan-600">
          Administrator
        </span>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">My Profile</h1>

        <p className="mt-1 text-sm text-slate-500">Manage your account.</p>

        {/* Decorative Icon */}

        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex">
          <User size={28} className="text-slate-400" />
        </div>
      </div>

      {/* Main Layout */}

      <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
        {/* Left - Avatar Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Avatar */}

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-4xl font-bold text-white shadow-lg">
                {avatarLetter}
              </div>

              {/* Camera */}

              <button
                type="button"
                className="absolute bottom-1 right-1 rounded-full bg-cyan-500 p-2.5 text-white shadow-lg transition hover:scale-110 hover:bg-cyan-600"
              >
                <Camera size={16} />
              </button>

              {/* Online */}

              <div className="absolute bottom-4 left-1 h-4 w-4 rounded-full border-4 border-white bg-green-500" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">{profile.email}</p>

            {/* Role */}

            <span className="mt-3 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-semibold text-cyan-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} />

                {profile.role}
              </span>
            </span>
          </div>
        </div>

        {/* Right - Profile Information */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Profile Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Edit your personal details.
            </p>
          </div>

          <div className="space-y-4">
            {/* Name */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-cyan-500 focus-within:bg-white hover:border-cyan-400">
                <div className="px-4">
                  <User
                    size={18}
                    className="text-slate-400 group-focus-within:text-cyan-500"
                  />
                </div>

                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                  className="w-full bg-transparent py-3 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address
              </label>

              <div className="group flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-cyan-500 focus-within:bg-white hover:border-cyan-400">
                <div className="px-4">
                  <Mail
                    size={18}
                    className="text-slate-400 group-focus-within:text-cyan-500"
                  />
                </div>

                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter email"
                  className="w-full bg-transparent py-3 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Info Box */}

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-cyan-500"
                  size={16}
                />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Your account is verified
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Keep your email updated to receive security alerts and
                    important notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Save + Inline Message */}

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleProfileUpdate}
                disabled={savingProfile}
                className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />

                {savingProfile ? "Saving..." : "Save Changes"}
              </button>

              {message.text && (
                <span
                  className={`text-sm font-medium ${
                    message.type === "success"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {message.text}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
