import { useMemo } from "react";
import ChartCard from "./ChartCard";

// Convert destination name into proper title case
function formatDestinationName(value) {
  if (!value) {
    return "Unknown Destination";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function MissingDestinationRequests({ data = [], onClearAll, onDelete }) {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Prepare request data
  const requests = useMemo(() => {
    return (
      safeData
        .map((item, index) => {
          // Get destination name
          const rawDestination =
            item?.destination ||
            item?.name ||
            item?.location ||
            item?.destinationName ||
            "Unknown Destination";

          // Get request count
          const requestCount = Number(
            item?.requests ??
              item?.requestCount ??
              item?.count ??
              item?.searches ??
              0,
          );

          // Get last searched date
          const lastSearched =
            item?.lastSearched ||
            item?.updatedAt ||
            item?.createdAt ||
            item?.searchedAt ||
            null;

          return {
            id: item?._id || item?.id || index,

            // Convert to proper capitalization
            destination: formatDestinationName(rawDestination),

            requests: Number.isFinite(requestCount) ? requestCount : 0,

            lastSearched,
          };
        })

        // Highest requests first
        .sort((a, b) => b.requests - a.requests)

        // Show only top 5
        .slice(0, 5)
    );
  }, [safeData]);

  // Format last searched text
  const getLastSearched = (date) => {
    if (!date) {
      return "Last searched today";
    }

    const searchedDate = new Date(date);

    if (Number.isNaN(searchedDate.getTime())) {
      return "Last searched today";
    }

    const now = new Date();

    const difference = now.getTime() - searchedDate.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return "Last searched today";
    }

    if (days === 1) {
      return "Last searched 1 day ago";
    }

    return `Last searched ${days} days ago`;
  };

  // Delete one destination
  const handleDelete = (id) => {
    if (typeof onDelete === "function") {
      onDelete(id);
    }
  };

  // Clear all destinations
  const handleClearAll = () => {
    if (typeof onClearAll === "function") {
      onClearAll();
    }
  };

  return (
    <ChartCard title="Missing Destination Requests">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          {/* Title + subtitle */}
          <div className="flex items-center gap-2">
            {/* Location icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                  stroke="#06b6d4"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="9"
                  r="2.2"
                  stroke="#06b6d4"
                  strokeWidth="1.8"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">
                Missing Destination Requests
              </p>

              <p className="text-xs text-slate-400">
                Most requested destinations not available
              </p>
            </div>
          </div>

          {/* Clear All button */}
          <button
            type="button"
            onClick={handleClearAll}
            disabled={requests.length === 0}
            className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear All
          </button>
        </div>

        {/* Request list */}
        {requests.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-500">
              No missing destination requests.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
            {requests.map((item, index) => {
              const rank = index + 1;

              return (
                <div
                  key={item.id}
                  className="flex min-h-[58px] items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  {/* Rank */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-semibold text-cyan-600">
                    #{rank}
                  </div>

                  {/* Destination icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                        stroke="#06b6d4"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="9"
                        r="2.2"
                        stroke="#06b6d4"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>

                  {/* Destination information */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.destination}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {getLastSearched(item.lastSearched)}
                    </p>
                  </div>

                  {/* Request count */}
                  <div className="shrink-0 rounded-full border border-red-100 bg-red-50 px-3 py-1">
                    <span className="text-xs font-medium text-red-500">
                      {item.requests.toLocaleString()}{" "}
                      {item.requests === 1 ? "Request" : "Requests"}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete ${item.destination}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 7h16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10 11v6M14 11v6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M6 7l1 13h10l1-13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M9 7V4h6v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default MissingDestinationRequests;
