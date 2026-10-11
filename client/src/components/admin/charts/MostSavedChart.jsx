import "./chartConfig";

import { Bar } from "react-chartjs-2";

import ChartCard from "./ChartCard";

// Show value at the end of each bar
const valueLabelPlugin = {
  id: "savedValueLabel",

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

function MostSavedChart({ data = [] }) {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Destination names
  const labels = safeData.map((item) => {
    return item?.destination || "Unknown";
  });

  // Wishlist save counts
  const saves = safeData.map((item) => {
    return Number(item?.saves || 0);
  });

  // Find highest save count
  const maxSaves = saves.length > 0 ? Math.max(...saves) : 0;

  // Find most saved destination
  let topDestination = null;

  if (safeData.length > 0) {
    topDestination = safeData.reduce((max, item) => {
      const currentSaves = Number(item?.saves || 0);
      const previousSaves = Number(max?.saves || 0);

      return currentSaves > previousSaves ? item : max;
    }, safeData[0]);
  }

  // Top destination name
  const topDestinationName = topDestination?.destination || "No data";

  // Top destination saves
  const topDestinationSaves = Number(topDestination?.saves || 0);

  // Dynamic X-axis maximum
  // Graph height will NOT change.
  const dynamicMax = maxSaves > 0 ? Math.ceil((maxSaves * 1.15) / 10) * 10 : 10;

  // Chart data
  const chartData = {
    labels,

    datasets: [
      {
        label: "Wishlist Saves",

        data: saves,

        // Pink bars
        backgroundColor: "#e05299",

        borderWidth: 0,

        // Rounded bars
        borderRadius: 6,

        borderSkipped: false,

        // Fixed bar height
        barThickness: 24,

        maxBarThickness: 24,

        categoryPercentage: 0.7,

        barPercentage: 0.7,

        // Hover color
        hoverBackgroundColor: "#d63d89",
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,

    // Keep graph inside fixed card
    maintainAspectRatio: false,

    // Horizontal bars
    indexAxis: "y",

    // Animation
    animation: {
      duration: 600,
      easing: "easeOutQuart",
    },

    plugins: {
      // Hide default legend
      legend: {
        display: false,
      },

      // Tooltip
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
            return `${context.parsed.x} wishlist saves`;
          },
        },
      },
    },

    scales: {
      // X Axis
      x: {
        beginAtZero: true,

        // Automatically adjusts when saves increase
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

      // Y Axis
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
    <ChartCard title="Most Saved Destinations">
      {/* Main content */}
      <div className="flex h-full min-h-0 flex-col">
        {/* Subtitle and filter */}
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <p className="text-sm text-slate-500">
            Top destinations by wishlist saves
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
              No saved destination data available.
            </p>
          </div>
        ) : (
          // Graph + insight
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_230px] gap-6">
            {/* Graph */}
            <div className="relative min-h-0 min-w-0">
              <Bar
                data={chartData}
                options={options}
                plugins={[valueLabelPlugin]}
              />
            </div>

            {/* Right side insight */}
            <div className="flex items-center">
              <div className="w-full rounded-xl border border-pink-100 bg-pink-50/40 p-4">
                {/* Heart icon */}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61C19.74 3.51 18.26 3 16.8 3C15.34 3 13.87 3.51 12.77 4.61L12 5.38L11.23 4.61C9.03 2.41 5.47 2.41 3.27 4.61C1.07 6.81 1.07 10.37 3.27 12.57L12 21.3L20.73 12.57C22.93 10.37 22.93 6.81 20.84 4.61Z"
                      stroke="#db2777"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Main message */}
                <p className="text-sm leading-5 text-slate-700">
                  <span className="font-semibold text-pink-600">
                    {topDestinationName}
                  </span>{" "}
                  is most saved destination
                </p>

                {/* Save count */}
                <p className="mt-1 text-xs text-slate-500">
                  {topDestinationSaves}{" "}
                  {topDestinationSaves === 1 ? "save" : "saves"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default MostSavedChart;
