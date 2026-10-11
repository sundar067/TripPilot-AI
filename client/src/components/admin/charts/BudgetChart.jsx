import "./chartConfig";

import { Doughnut } from "react-chartjs-2";

import ChartCard from "./ChartCard";

// Fixed budget ranges
const budgetRanges = [
  {
    id: 0,
    label: "Below ₹5,000",
    color: "#3b82f6",
  },
  {
    id: 5000,
    label: "₹5,000 - ₹10,000",
    color: "#6d3df5",
  },
  {
    id: 10000,
    label: "₹10,000 - ₹20,000",
    color: "#22c55e",
  },
  {
    id: 20000,
    label: "₹20,000 - ₹50,000",
    color: "#f59e0b",
  },
  {
    id: 50000,
    label: "Above ₹50,000",
    color: "#ec4899",
  },
];

function BudgetChart({ data = [] }) {
  // Make sure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Get trip count for each fixed budget range
  const values = budgetRanges.map((range) => {
    const item = safeData.find((item) => Number(item?._id) === range.id);

    return Number(item?.trips || 0);
  });

  // Total trips
  const totalTrips = values.reduce((sum, value) => {
    return sum + value;
  }, 0);

  // Calculate percentage
  const percentages = values.map((value) => {
    if (totalTrips === 0) return "0.0";

    return ((value / totalTrips) * 100).toFixed(1);
  });

  // Chart data
  const chartData = {
    labels: budgetRanges.map((range) => range.label),

    datasets: [
      {
        label: "Trips",

        data: values,

        // Fixed colors
        backgroundColor: budgetRanges.map((range) => range.color),

        // White gap between sections
        borderColor: "#ffffff",

        borderWidth: 3,

        // Hover effect
        hoverOffset: 6,

        // Slightly rounded edges
        borderRadius: 2,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,

    // Keep chart inside fixed container
    maintainAspectRatio: false,

    // Donut thickness
    cutout: "68%",

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

        displayColors: true,

        callbacks: {
          label: (context) => {
            const value = Number(context.raw || 0);

            const percentage =
              totalTrips > 0 ? ((value / totalTrips) * 100).toFixed(1) : "0.0";

            return ` ${value.toLocaleString()} trips (${percentage}%)`;
          },
        },
      },
    },

    // Smooth animation
    animation: {
      duration: 700,

      easing: "easeOutQuart",
    },
  };

  return (
    <ChartCard title="Budget Distribution">
      {/* Main content */}
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <p className="text-sm text-slate-500">
            Trips distribution by budget range
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

        {totalTrips === 0 ? (
          // Empty state
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-500">No budget data available.</p>
          </div>
        ) : (
          // Donut + fixed budget legend
          <div className="grid min-h-0 flex-1 grid-cols-[180px_minmax(0,1fr)] items-center gap-5">
            {/* Donut */}
            <div className="relative h-[190px] w-[190px]">
              <Doughnut data={chartData} options={options} />

              {/* Center text */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold leading-none text-slate-900">
                  {totalTrips.toLocaleString()}
                </span>

                <span className="mt-2 text-xs font-medium text-slate-400">
                  Total Trips
                </span>
              </div>
            </div>

            {/* Budget legend */}
            <div className="min-w-0 space-y-3">
              {budgetRanges.map((range, index) => {
                const value = values[index];

                const percentage = percentages[index];

                return (
                  <div
                    key={range.id}
                    className="flex items-center justify-between gap-3"
                  >
                    {/* Left side */}
                    <div className="flex min-w-0 items-center gap-2">
                      {/* Color dot */}
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: range.color,
                        }}
                      />

                      {/* Budget range */}
                      <span className="whitespace-nowrap text-xs font-medium text-slate-600">
                        {range.label}
                      </span>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-medium text-slate-600">
                        {value.toLocaleString()}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default BudgetChart;
