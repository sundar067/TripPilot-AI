import {
  X,
  User,
  ShieldCheck,
  Calendar,
  Clock3,
  Mail,
  CheckCircle2,
  Ban,
  Database,
  Plane,
  Heart,
  Star,
  MapPin,
} from "lucide-react";

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>

            <p className="text-sm text-slate-500">
              Complete account information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Body */}

        <div className="flex-1 overflow-y-auto">
          {/* Profile */}

          <div className="border-b px-6 py-6">
            <div className="flex items-center gap-5">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${
                  user.isSuperAdmin
                    ? "bg-gradient-to-br from-amber-500 to-yellow-500"
                    : "bg-cyan-500"
                }`}
              >
                {user.isSuperAdmin ? (
                  <ShieldCheck size={34} />
                ) : (
                  <User size={34} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-2xl font-bold text-slate-800">
                  {user.name}
                </h3>

                <p className="truncate text-slate-500">{user.email}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {user.isSuperAdmin ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Super Admin
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        user.role === "admin"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  )}

                  {user.isBlocked ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      <Ban size={13} />
                      Blocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={13} />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* Account Information */}

            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="mb-5 text-lg font-bold text-slate-800">
                Account Information
              </h4>

              <div className="space-y-4">
                <InfoRow
                  icon={<Mail size={17} />}
                  label="Email"
                  value={user.email}
                />

                <InfoRow
                  icon={<Calendar size={17} />}
                  label="Joined"
                  value={joinedDate}
                />

                <InfoRow
                  icon={<Clock3 size={17} />}
                  label="Last Login"
                  value={lastLogin}
                />

                <InfoRow
                  icon={<Database size={17} />}
                  label="User ID"
                  value={user._id}
                  mono
                />
              </div>
            </div>

            {/* User Activity */}

            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="mb-5 text-lg font-bold text-slate-800">
                User Activity
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={<Plane size={18} />}
                  title="Trips"
                  value={user.totalTrips ?? 0}
                />

                <StatCard
                  icon={<Heart size={18} />}
                  title="Saved"
                  value={user.savedDestinations ?? 0}
                />

                <StatCard
                  icon={<Star size={18} />}
                  title="Reviews"
                  value={user.totalReviews ?? 0}
                />
              </div>

              {/* Recent Trips */}

              <div className="mt-6">
                <h5 className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
                  <MapPin size={16} />
                  Recent Trips
                </h5>

                {user.recentTrips?.length > 0 ? (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                    {user.recentTrips.map((trip) => (
                      <RecentTripCard key={trip._id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 py-5 text-center text-sm text-slate-500">
                    No recent trips found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="sticky bottom-0 border-t bg-white px-6 py-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Info Row

const InfoRow = ({ icon, label, value, mono }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-cyan-600">{icon}</div>

    <div className="min-w-0 flex-1">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>

      <p
        className={`break-all text-sm font-medium text-slate-800 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

// Stat Card

const StatCard = ({ icon, title, value }) => (
  <div className="rounded-xl bg-slate-50 p-4 text-center transition hover:bg-cyan-50">
    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
      {icon}
    </div>

    <p className="text-2xl font-bold text-slate-800">{value}</p>

    <p className="mt-1 text-xs font-medium text-slate-500">{title}</p>
  </div>
);

// Recent Trip Card

const RecentTripCard = ({ trip }) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 transition hover:border-cyan-300 hover:bg-cyan-50">
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-800">
        {trip.destination}
      </p>

      <p className="text-xs text-slate-500">
        {trip.createdAt
          ? new Date(trip.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </p>
    </div>

    <MapPin size={18} className="shrink-0 text-cyan-500" />
  </div>
);

export default UserDetailsModal;