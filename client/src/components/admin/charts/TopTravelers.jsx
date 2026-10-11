import ChartCard from "./ChartCard";

function TopTravelers({ data = [] }) {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Get only top 5 travelers
  const travelers = safeData
    .map((item) => {
      // Support different possible backend structures
      const user = item?.user || item?.userId || item;

      const name =
        item?.name ||
        item?.username ||
        user?.name ||
        user?.username ||
        "Unknown User";

      const email = item?.email || user?.email || "";

      const trips = Number(
        item?.trips ?? item?.tripCount ?? item?.totalTrips ?? item?.count ?? 0,
      );

      return {
        name,
        email,
        trips: Number.isFinite(trips) ? trips : 0,
      };
    })
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 5);

  // Get initials
  const getInitials = (name) => {
    if (!name || name === "Unknown User") {
      return "U";
    }

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <ChartCard title="Top Travelers">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <p className="text-sm text-slate-500">
            Users with most trips planned
          </p>

          {/* Filter */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            All Time
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Travelers */}
        {travelers.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-500">
              No traveler data available.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
            {travelers.map((traveler, index) => {
              const rank = index + 1;

              return (
                <div
                  key={`${traveler.email || traveler.name}-${index}`}
                  className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  {/* Rank */}
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      rank === 1
                        ? "bg-orange-50 text-orange-600"
                        : rank === 2
                          ? "bg-slate-100 text-slate-600"
                          : rank === 3
                            ? "bg-amber-50 text-amber-600"
                            : "bg-white text-slate-600"
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600">
                    {getInitials(traveler.name)}
                  </div>

                  {/* User information */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {traveler.name}
                    </p>

                    {traveler.email ? (
                      <p className="truncate text-xs text-slate-400">
                        {traveler.email}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        No email available
                      </p>
                    )}
                  </div>

                  {/* Trips */}
                  <div className="flex min-w-[58px] shrink-0 flex-col items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5">
                    <span className="text-sm font-bold leading-none text-blue-600">
                      {traveler.trips.toLocaleString()}
                    </span>

                    <span className="mt-1 text-[10px] font-medium text-blue-500">
                      trips
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default TopTravelers;
