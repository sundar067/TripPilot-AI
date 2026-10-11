import "./chartConfig";

import { Bar } from "react-chartjs-2";

import ChartCard from "./ChartCard";

// Show value at the end of each bar
const valueLabelPlugin = {
  id: "valueLabel",

  afterDatasetsDraw(chart) {
    const { ctx } = chart;

    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    if (!dataset || !meta) return;

    ctx.save();

    ctx.font = "500 12px Arial";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    meta.data.forEach((bar, index) => {
      const value = dataset.data[index];

      if (value === undefined || value === null) return;

      ctx.fillText(String(value), bar.x + 8, bar.y);
    });

    ctx.restore();
  },
};

function MostPlannedChart({ data = [] }) {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Destination names
  const labels = safeData.map((item) => {
    return item?._id || "Unknown";
  });

  // Trip counts
  const trips = safeData.map((item) => {
    return Number(item?.trips || 0);
  });

  // Find highest value
  const maxTrips = trips.length > 0 ? Math.max(...trips) : 0;

  // Find top destination
  const topDestination =
    safeData.length > 0
      ? safeData.reduce((max, item) => {
          return Number(item?.trips || 0) > Number(max?.trips || 0)
            ? item
            : max;
        }, safeData[0])
      : null;

  // Top destination name
  const topDestinationName = topDestination?._id || "No data";

  // Top destination trips
  const topDestinationTrips = Number(topDestination?.trips || 0);

  // Dynamic X-axis maximum
  // Graph card height stays fixed.
  const dynamicMax = maxTrips > 0 ? Math.ceil((maxTrips * 1.15) / 10) * 10 : 10;

  // Chart data
  const chartData = {
    labels,

    datasets: [
      {
        label: "Trips Planned",

        data: trips,

        backgroundColor: "#4fc56a",

        borderWidth: 0,

        borderRadius: 6,

        borderSkipped: false,

        // Fixed visual bar thickness
        barThickness: 24,

        maxBarThickness: 24,

        categoryPercentage: 0.7,

        barPercentage: 0.7,

        hoverBackgroundColor: "#3dbb5b",
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,

    // Important:
    // Chart fills the fixed container.
    // It will NOT increase the card height.
    maintainAspectRatio: false,

    indexAxis: "y",

    animation: {
      duration: 600,

      easing: "easeOutQuart",
    },

    plugins: {
      // We are using our own value labels
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

        padding: 10,

        displayColors: false,

        callbacks: {
          title: (context) => {
            return context[0]?.label || "";
          },

          label: (context) => {
            return `${context.parsed.x} trips planned`;
          },
        },
      },
    },

    scales: {
      // Horizontal value axis
      x: {
        beginAtZero: true,

        // Dynamic maximum
        // Changes according to highest trip count.
        max: dynamicMax,

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
          color: "#e8edf3",

          lineWidth: 1,

          drawTicks: false,
        },
      },

      // Destination axis
      y: {
        border: {
          display: false,
        },

        ticks: {
          color: "#475569",

          font: {
            size: 12,

            weight: "500",
          },

          padding: 10,
        },

        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <ChartCard title="Most Planned Destinations">
      {/* Fixed-height content */}
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <p className="text-sm text-slate-500">
            Top destinations by number of trips
          </p>

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

        {safeData.length === 0 ? (
          // Empty state
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-500">
              No planned destination data available.
            </p>
          </div>
        ) : (
          // Chart + insight
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_230px] gap-6">
            {/* Graph */}
            <div className="relative min-h-0 min-w-0">
              <Bar
                data={chartData}
                options={options}
                plugins={[valueLabelPlugin]}
              />
            </div>

            {/* Insight */}
            <div className="flex items-center">
              <div className="w-full rounded-xl border border-green-100 bg-green-50/40 p-4">
                {/* Icon */}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 19V14"
                      stroke="#22a447"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M10 19V10"
                      stroke="#22a447"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M16 19V6"
                      stroke="#22a447"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M22 19V3"
                      stroke="#22a447"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M3 19H23"
                      stroke="#22a447"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M4 11L10 7L16 9L22 3"
                      stroke="#22a447"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Insight text */}
                <p className="text-sm leading-5 text-slate-700">
                  <span className="font-semibold text-green-600">
                    {topDestinationName}
                  </span>{" "}
                  is the most planned destination
                </p>

                {/* Trip count */}
                <p className="mt-1 text-xs text-slate-500">
                  {topDestinationTrips}{" "}
                  {topDestinationTrips === 1 ? "trip" : "trips"} planned
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default MostPlannedChart;
