import "./chartConfig";

import { Line } from "react-chartjs-2";

import ChartCard from "./ChartCard";

// Month names
const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function TripsPerMonthChart({ data = [] }) {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Get year from MongoDB data
  const getYear = (item) => {
    return item?._id?.year ?? item?.year ?? item?.date?.year ?? null;
  };

  // Get month from MongoDB data
  const getMonth = (item) => {
    return item?._id?.month ?? item?.month ?? item?.date?.month ?? null;
  };

  // Sort data by year and month
  const sortedData = [...safeData].sort((a, b) => {
    const yearA = Number(getYear(a) || 0);
    const yearB = Number(getYear(b) || 0);

    const monthA = Number(getMonth(a) || 0);
    const monthB = Number(getMonth(b) || 0);

    if (yearA !== yearB) {
      return yearA - yearB;
    }

    return monthA - monthB;
  });

  // Create month labels
  const labels = sortedData.map((item) => {
    const year = getYear(item);
    const month = getMonth(item);

    if (year && month) {
      return `${monthNames[Number(month)] || month} ${year}`;
    }

    return "Unknown";
  });

  // Get real MongoDB trip count
  const trips = sortedData.map((item) => {
    return Number(item?.trips ?? item?.count ?? 0);
  });

  // Current value
  const currentValue = trips.length > 0 ? trips[trips.length - 1] : 0;

  // Previous value
  const previousValue = trips.length > 1 ? trips[trips.length - 2] : 0;

  // Calculate real percentage change
  let percentageChange = 0;

  if (previousValue > 0) {
    percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  }

  const isPositive = percentageChange >= 0;

  const formattedPercentage = Math.abs(percentageChange).toFixed(1);

  // Chart data
  const chartData = {
    labels,

    datasets: [
      {
        label: "Trips",

        data: trips,

        // Purple line
        borderColor: "#7c3aed",

        // Light purple area
        backgroundColor: "rgba(124, 58, 237, 0.13)",

        // Fill area
        fill: true,

        // Smooth curve
        tension: 0.45,

        cubicInterpolationMode: "monotone",

        // Line thickness
        borderWidth: 3,

        // Points
        pointRadius: 4.5,

        pointHoverRadius: 7,

        pointBackgroundColor: "#7c3aed",

        pointBorderColor: "#ffffff",

        pointBorderWidth: 2,

        pointHoverBackgroundColor: "#6d28d9",
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: "index",

      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,

        backgroundColor: "#ffffff",

        titleColor: "#0f172a",

        bodyColor: "#475569",

        borderColor: "#e2e8f0",

        borderWidth: 1,

        padding: 12,

        displayColors: false,

        titleFont: {
          size: 13,

          weight: "600",
        },

        bodyFont: {
          size: 13,
        },

        callbacks: {
          label: (context) => {
            return ` Trips: ${context.parsed.y}`;
          },
        },
      },
    },

    scales: {
      // X Axis
      x: {
        border: {
          display: false,
        },

        ticks: {
          color: "#64748b",

          font: {
            size: 11,
          },

          padding: 8,

          maxRotation: 0,

          minRotation: 0,

          autoSkip: true,

          maxTicksLimit: 7,
        },

        grid: {
          display: false,
        },
      },

      // Y Axis
      y: {
        beginAtZero: true,

        border: {
          display: false,
        },

        ticks: {
          color: "#64748b",

          font: {
            size: 11,
          },

          padding: 8,

          precision: 0,

          callback: (value) => {
            return Number.isInteger(value) ? value : "";
          },
        },

        grid: {
          color: "#edf2f7",

          lineWidth: 1,
        },
      },
    },

    // Chart animation
    animation: {
      duration: 700,

      easing: "easeOutQuart",
    },

    // Hover
    hover: {
      mode: "index",

      intersect: false,
    },
  };

  return (
    <ChartCard title="Trips Per Month">
      <div className="flex h-full flex-col">
        {/* Subtitle */}
        <p className="mb-2 text-sm text-slate-500">
          Total trips planned over time
        </p>

        {sortedData.length === 0 ? (
          // Empty state
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-500">No trip data available</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="min-h-0 flex-1">
              <Line data={chartData} options={options} />
            </div>

            {/* Bottom summary */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/30 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isPositive ? "bg-violet-100" : "bg-red-100"
                  }`}
                >
                  <span
                    className={`text-lg font-bold ${
                      isPositive ? "text-violet-600" : "text-red-500"
                    }`}
                  >
                    {isPositive ? "↑" : "↓"}
                  </span>
                </div>

                <div>
                  <p
                    className={`text-base font-bold ${
                      isPositive ? "text-violet-600" : "text-red-500"
                    }`}
                  >
                    {formattedPercentage}%
                  </p>

                  <p className="text-xs text-slate-500">from last month</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  {currentValue}
                </p>

                <p className="text-xs text-slate-500">this month</p>
              </div>
            </div>
          </>
        )}
      </div>
    </ChartCard>
  );
}

export default TripsPerMonthChart;
