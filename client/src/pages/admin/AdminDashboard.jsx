import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Map,
  MapPin,
  Star,
  Users,
  Plane,
  Heart,
  CalendarDays,
  Clock,
} from "lucide-react";

import { getDashboardStats } from "../../services/userService";
import { getAnalytics } from "../../services/analyticsService";

import {
  getMissingDestinations,
  deleteMissingDestination,
  clearMissingDestinations,
} from "../../services/missingDestinationService";

import QuickActionCard from "../../components/admin/QuickActionCard";
import RecentActivity from "../../components/admin/RecentActivity";

import UserGrowthChart from "../../components/admin/charts/UserGrowthChart";
import TripsPerMonthChart from "../../components/admin/charts/TripsPerMonthChart";
import MostPlannedChart from "../../components/admin/charts/MostPlannedChart";
import MostSavedChart from "../../components/admin/charts/MostSavedChart";
import BudgetChart from "../../components/admin/charts/BudgetChart";
import TopTravelers from "../../components/admin/charts/TopTravelers";
import MissingDestinations from "../../components/admin/charts/MissingDestinations";

function AdminDashboard() {
  const navigate = useNavigate();

  // Logged in user
  const user = JSON.parse(localStorage.getItem("user"));

  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStates: 0,
    totalDestinations: 0,
    totalAttractions: 0,
    totalTrips: 0,
  });

  // Analytics data
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalTrips: 0,
      totalWishlists: 0,
      totalDestinations: 0,
    },

    userGrowth: [],
    tripGrowth: [],
    destinationGrowth: [],
    attractionGrowth: [],
    wishlistGrowth: [],

    tripsPerMonth: [],
    mostPlannedDestinations: [],
    mostSavedDestinations: [],
    budgetDistribution: [],
    topTravelers: [],
  });

  // Missing destination data
  const [missingDestinations, setMissingDestinations] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Current date and time
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [dashboardData, analyticsData, missingData] = await Promise.all([
        getDashboardStats(),
        getAnalytics(),
        getMissingDestinations(),
      ]);

      // Save dashboard stats
      setStats(dashboardData || {});

      // Save analytics data
      setAnalytics({
        ...analyticsData,

        overview: {
          totalUsers: analyticsData?.overview?.totalUsers || 0,
          totalTrips: analyticsData?.overview?.totalTrips || 0,
          totalWishlists: analyticsData?.overview?.totalWishlists || 0,
          totalDestinations: analyticsData?.overview?.totalDestinations || 0,
        },

        userGrowth: analyticsData?.userGrowth || [],

        tripGrowth:
          analyticsData?.tripGrowth ||
          analyticsData?.tripsGrowth ||
          analyticsData?.tripsPerMonth ||
          [],

        destinationGrowth:
          analyticsData?.destinationGrowth ||
          analyticsData?.destinationsGrowth ||
          [],

        attractionGrowth:
          analyticsData?.attractionGrowth ||
          analyticsData?.attractionsGrowth ||
          [],

        wishlistGrowth:
          analyticsData?.wishlistGrowth || analyticsData?.wishlistsGrowth || [],

        tripsPerMonth: analyticsData?.tripsPerMonth || [],

        mostPlannedDestinations: analyticsData?.mostPlannedDestinations || [],

        mostSavedDestinations: analyticsData?.mostSavedDestinations || [],

        budgetDistribution: analyticsData?.budgetDistribution || [],

        topTravelers: analyticsData?.topTravelers || [],
      });

      // Save missing destination data
      setMissingDestinations(
        missingData?.destinations || missingData?.data || [],
      );
    } catch (error) {
      console.error("Dashboard Error:", error);

      setMissingDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete one missing destination
  const handleDeleteMissingDestination = async (id) => {
    try {
      // Check ID
      if (!id) {
        console.error("Missing destination ID");
        return;
      }

      // Delete from database
      await deleteMissingDestination(id);

      // Remove from UI
      setMissingDestinations((previous) =>
        previous.filter((item) => {
          const itemId = item?._id || item?.id;

          return String(itemId) !== String(id);
        }),
      );
    } catch (error) {
      console.error("Delete missing destination error:", error);
    }
  };

  // Delete all missing destinations
  const handleClearMissingDestinations = async () => {
    try {
      // Nothing to delete
      if (missingDestinations.length === 0) {
        return;
      }

      // Delete all from database
      await clearMissingDestinations();

      // Clear from UI
      setMissingDestinations([]);
    } catch (error) {
      console.error("Clear missing destinations error:", error);
    }
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Logout admin
  const handleAdminLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // Get current day
  const day = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Get current date
  const date = currentDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Get current time
  const time = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Get numeric value
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
  const getTrendValues = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item) => getValue(item))
      .filter((value) => Number.isFinite(value));
  };

  // Calculate percentage change
  const getPercentageChange = (data) => {
    const values = getTrendValues(data);

    if (values.length < 2) {
      return null;
    }

    const previousValue = values[values.length - 2];
    const currentValue = values[values.length - 1];

    if (previousValue === 0) {
      if (currentValue === 0) {
        return 0;
      }

      return 100;
    }

    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Get trend information
  const getTrendDetails = (percentage) => {
    if (percentage === null) {
      return {
        arrow: "→",
        color: "text-slate-400",
      };
    }

    if (percentage > 0) {
      return {
        arrow: "↗",
        color: "text-emerald-500",
      };
    }

    if (percentage < 0) {
      return {
        arrow: "↘",
        color: "text-red-500",
      };
    }

    return {
      arrow: "→",
      color: "text-slate-400",
    };
  };

  // Format percentage
  const formatPercentage = (percentage) => {
    if (percentage === null) {
      return "0.0%";
    }

    return `${Math.abs(percentage).toFixed(1)}%`;
  };

  // Small trend graph
  const TrendGraph = ({ data, color }) => {
    const values = getTrendValues(data);

    if (values.length < 2) {
      return <div className="mt-4 h-7 w-full" />;
    }

    const width = 180;
    const height = 28;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const range = maxValue - minValue || 1;

    const points = values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width;

        const y = height - ((value - minValue) / range) * (height - 4) - 2;

        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="mt-4 h-7 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`h-7 w-full ${color}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="currentColor"
            opacity="0.08"
          />

          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  // Overview card
  const OverviewCard = ({
    title,
    value,
    icon,
    iconBackground,
    iconColor,
    trendData,
    lineColor,
  }) => {
    const percentage = getPercentageChange(trendData);

    const trend = getTrendDetails(percentage);

    return (
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        {/* Icon */}

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackground}`}
        >
          <span className={iconColor}>{icon}</span>
        </div>

        {/* Title */}

        <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>

        {/* Value */}

        <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>

        {/* Percentage */}

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.color}`}>
            {trend.arrow} {formatPercentage(percentage)}
          </span>

          <span className="text-slate-400">from last month</span>
        </div>

        {/* Graph */}

        <TrendGraph data={trendData} color={lineColor} />
      </div>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Welcome section */}

      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Welcome back, {user?.name || "Admin"} 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Here's what's happening with TripPilot AI today.
          </p>
        </div>

        {/* Date and time */}

        <div
          className="
            flex
            h-[66px]
            w-fit
            max-w-full
            shrink-0
            items-center
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            shadow-sm
          "
        >
          {/* Calendar icon */}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
            <CalendarDays size={19} className="text-slate-600" />
          </div>

          {/* Date and time */}

          <div className="min-w-max">
            {/* Day and date stay on one line */}

            <p className="whitespace-nowrap text-sm font-semibold leading-tight text-slate-900">
              {day}, {date}
            </p>

            {/* Time stays below */}

            <div className="mt-1 flex items-center gap-1.5">
              <Clock size={13} className="shrink-0 text-slate-400" />

              <p className="whitespace-nowrap text-xs font-medium text-slate-500">
                {time}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard overview */}

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <OverviewCard
            title="Total Users"
            value={analytics.overview.totalUsers}
            icon={<Users size={23} />}
            iconBackground="bg-purple-100"
            iconColor="text-purple-600"
            trendData={analytics.userGrowth}
            lineColor="text-purple-500"
          />

          <OverviewCard
            title="Total Trips"
            value={analytics.overview.totalTrips}
            icon={<Plane size={23} />}
            iconBackground="bg-sky-100"
            iconColor="text-sky-500"
            trendData={analytics.tripGrowth}
            lineColor="text-sky-500"
          />

          <OverviewCard
            title="Total Destinations"
            value={analytics.overview.totalDestinations}
            icon={<MapPin size={23} />}
            iconBackground="bg-emerald-100"
            iconColor="text-emerald-500"
            trendData={analytics.destinationGrowth}
            lineColor="text-emerald-500"
          />

          <OverviewCard
            title="Total Attractions"
            value={stats.totalAttractions}
            icon={<Star size={23} />}
            iconBackground="bg-amber-100"
            iconColor="text-amber-500"
            trendData={analytics.attractionGrowth}
            lineColor="text-amber-500"
          />

          <OverviewCard
            title="Total Wishlists"
            value={analytics.overview.totalWishlists}
            icon={<Heart size={23} />}
            iconBackground="bg-rose-100"
            iconColor="text-rose-500"
            trendData={analytics.wishlistGrowth}
            lineColor="text-rose-500"
          />
        </div>
      </section>

      {/* Quick actions */}

      <section>
        <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <QuickActionCard
            title="Manage States"
            description="Create, update and manage all Indian states."
            icon={<Map size={30} />}
            link="/admin/states"
            color="bg-blue-500"
          />

          <QuickActionCard
            title="Manage Destinations"
            description="Create and maintain destination information."
            icon={<MapPin size={30} />}
            link="/admin/destinations"
            color="bg-green-500"
          />

          <QuickActionCard
            title="Manage Attractions"
            description="Manage attractions and tourist places."
            icon={<Star size={30} />}
            link="/admin/attractions"
            color="bg-yellow-500"
          />
        </div>
      </section>

      {/* Analytics */}

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Analytics Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track your TripPilot AI activity and performance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* User Growth */}

          <div className="min-w-0">
            <UserGrowthChart data={analytics.userGrowth || []} />
          </div>

          {/* Trips Per Month */}

          <div className="min-w-0">
            <TripsPerMonthChart data={analytics.tripsPerMonth || []} />
          </div>

          {/* Most Planned */}

          <div className="min-w-0 xl:col-span-2">
            <MostPlannedChart data={analytics.mostPlannedDestinations || []} />
          </div>

          {/* Most Saved */}

          <div className="min-w-0 xl:col-span-2">
            <MostSavedChart data={analytics.mostSavedDestinations || []} />
          </div>

          {/* Budget */}

          <div className="min-w-0">
            <BudgetChart data={analytics.budgetDistribution || []} />
          </div>

          {/* Top Travelers */}

          <div className="min-w-0">
            <TopTravelers data={analytics.topTravelers || []} />
          </div>

          {/* Missing Destination Requests */}

          <div className="min-w-0 xl:col-span-2">
            <MissingDestinations
              data={missingDestinations}
              onDelete={handleDeleteMissingDestination}
              onClearAll={handleClearMissingDestinations}
            />
          </div>

          {/* Recent Activity */}

          <div className="min-w-0 xl:col-span-2">
            <RecentActivity />
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;