import { useEffect, useState } from "react";

// Backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent activity
  const fetchActivities = async () => {
    try {
      setLoading(true);

      // Get login token
      const token = localStorage.getItem("token");

      // Get activity from backend
      const response = await fetch(`${API_BASE_URL}/api/admin/activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch recent activity");
      }

      // Backend sends activity inside "data"
      setActivities(result.data || []);
    } catch (error) {
      console.error("Recent Activity Error:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity when page loads
  useEffect(() => {
    fetchActivities();
  }, []);

  // Format date and time
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // User registration icon
  const UserIcon = () => {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.8" />
        </svg>
      </div>
    );
  };

  // Proper airplane icon
  const TripIcon = () => {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          {/* Main airplane body */}
          <path
            d="M21.5 3.5c-.5-.5-1.2-.6-1.8-.2L13.2 8 5 5.5c-.5-.2-1.1 0-1.4.4l-.5.7c-.3.5-.1 1.1.4 1.4l6.3 3.2-3.4 3.4-3.1-.6c-.5-.1-1 .1-1.2.6l-.2.4c-.2.5 0 1 .5 1.2l4.5 1.7 1.7 4.5c.2.5.7.7 1.2.5l.4-.2c.5-.2.7-.7.6-1.2l-.6-3.1 3.4-3.4 3.2 6.3c.3.5.9.7 1.4.4l.7-.5c.4-.3.6-.9.4-1.4L16.5 10l4.7-6.5c.4-.6.3-1.3-.2-1.8Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  // Clock icon
  const ClockIcon = () => {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />

        <path
          d="M12 8v4l3 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>

          {/* Info icon */}
          <div className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-400">
            i
          </div>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ClockIcon />
          <span>Live</span>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />
            Loading activity...
          </div>
        </div>
      ) : activities.length === 0 ? (
        /* Empty state */
        <div className="flex h-[300px] flex-col items-center justify-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <ClockIcon />
          </div>

          <p className="text-sm font-medium text-slate-500">
            No recent activity available.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            New user and trip activity will appear here.
          </p>
        </div>
      ) : (
        /* Activity cards */
        <div className="space-y-3">
          {activities.map((item, index) => {
            // Check activity type
            const isUserRegistered = item.type === "user";

            return (
              <div
                key={`${item.type}-${item.createdAt}-${index}`}
                className="flex min-h-[76px] items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition-all duration-200 hover:border-cyan-200 hover:bg-slate-50 hover:shadow-sm"
              >
                {/* Activity icon */}
                {isUserRegistered ? <UserIcon /> : <TripIcon />}

                {/* Activity details */}
                <div className="min-w-0 flex-1">
                  {/* Activity title */}
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>

                  {/* Activity description */}
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {item.description}
                  </p>
                </div>

                {/* Date and time */}
                <p className="shrink-0 text-right text-xs text-slate-400">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
