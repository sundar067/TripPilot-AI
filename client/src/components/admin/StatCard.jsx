import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon, color, link, trendData = [] }) => {
  // Get numeric values from trend data
  const getValue = (item) => {
    if (typeof item === "number") {
      return item;
    }

    if (!item || typeof item !== "object") {
      return 0;
    }

    return Number(
      item.count ??
        item.total ??
        item.value ??
        item.users ??
        item.trips ??
        item.destinations ??
        item.attractions ??
        item.wishlists ??
        0,
    );
  };

  // Get trend values
  const values = Array.isArray(trendData)
    ? trendData
        .map((item) => getValue(item))
        .filter((value) => Number.isFinite(value))
    : [];

  // Calculate percentage change
  let percentage = 0;

  if (values.length >= 2) {
    const previousValue = values[values.length - 2];

    const currentValue = values[values.length - 1];

    if (previousValue === 0) {
      percentage = currentValue === 0 ? 0 : 100;
    } else {
      percentage = ((currentValue - previousValue) / previousValue) * 100;
    }
  }

  // Get trend direction
  const isPositive = percentage > 0;

  const isNegative = percentage < 0;

  const arrow = isPositive ? "↗" : isNegative ? "↘" : "→";

  // Trend color
  const trendColor = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-red-500"
      : "text-slate-400";

  const dotColor = isPositive
    ? "bg-emerald-500"
    : isNegative
      ? "bg-red-500"
      : "bg-slate-400";

  // Format percentage
  const formattedPercentage = Math.abs(percentage).toFixed(1);

  // Create graph points
  const createGraphPoints = () => {
    if (values.length < 2) {
      return "";
    }

    const width = 180;

    const height = 30;

    const minValue = Math.min(...values);

    const maxValue = Math.max(...values);

    const range = maxValue - minValue || 1;

    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width;

        const y = height - 3 - ((value - minValue) / range) * (height - 6);

        return `${x},${y}`;
      })
      .join(" ");
  };

  const graphPoints = createGraphPoints();

  // Card UI
  const Card = (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top Content */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="min-w-0">
          {/* Title */}
          <p className="text-sm font-medium text-slate-600">{title}</p>

          {/* Value */}
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          {/* Growth */}
          <p
            className={`mt-3 flex items-center gap-2 text-xs font-medium ${trendColor}`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center text-xs font-bold`}
            >
              {arrow}
            </span>
            {formattedPercentage}% from last month
          </p>
        </div>

        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color} text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>

      {/* Real Trend Graph */}
      {values.length >= 2 && (
        <div className="mt-4 h-8 w-full overflow-hidden">
          <svg
            viewBox="0 0 180 30"
            className={`h-8 w-full ${
              isPositive
                ? "text-emerald-500"
                : isNegative
                  ? "text-red-500"
                  : "text-slate-400"
            }`}
            preserveAspectRatio="none"
          >
            {/* Area */}
            <polygon
              points={`0,30 ${graphPoints} 180,30`}
              fill="currentColor"
              opacity="0.08"
            />

            {/* Line */}
            <polyline
              points={graphPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Bottom subtle accent */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-slate-100" />
    </div>
  );

  // Clickable card
  if (link) {
    return (
      <Link to={link} className="block">
        {Card}
      </Link>
    );
  }

  // Normal card
  return Card;
};

export default StatCard;
