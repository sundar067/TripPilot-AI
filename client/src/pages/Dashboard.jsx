import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plane,
  Heart,
  Clock3,
  MapPin,
  Plus,
  ArrowRight,
  Trash2,
} from "lucide-react";

import { deleteTrip, getMyTrips } from "../services/tripService";
import { getUserWishlist, toggleWishlist } from "../services/wishlistService";
import { getRecentlyViewed } from "../services/recentlyViewedService";

function Dashboard() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentDestinations, setRecentDestinations] = useState([]);

  const [tripsLoading, setTripsLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  // Get logged-in user
  const getLoggedInUser = () => {
    const possibleKeys = ["user", "tripPilotUser", "authUser", "userInfo"];

    for (const key of possibleKeys) {
      const storedData = localStorage.getItem(key);

      if (!storedData) continue;

      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.log(`Invalid user data inside ${key}`, error);
      }
    }

    return null;
  };

  // Get logged-in user ID
  const getLoggedInUserId = () => {
    const storedUser = getLoggedInUser();

    return (
      storedUser?._id ||
      storedUser?.id ||
      storedUser?.user?._id ||
      storedUser?.user?.id ||
      null
    );
  };

  const user = getLoggedInUser();

  const username = user?.name || user?.user?.name || "Traveler";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tripPilotUser");
    localStorage.removeItem("authUser");
    localStorage.removeItem("userInfo");

    navigate("/login");
  };

  // Fetch saved trips
  const fetchTrips = async () => {
    try {
      const response = await getMyTrips();

      setTrips(Array.isArray(response.data?.trips) ? response.data.trips : []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setTrips([]);
    } finally {
      setTripsLoading(false);
    }
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        setWishlist([]);
        return;
      }

      const response = await getUserWishlist(userId);

      setWishlist(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Fetch recently viewed
  const fetchRecentDestinations = async () => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        setRecentDestinations([]);
        return;
      }

      const response = await getRecentlyViewed(userId);

      setRecentDestinations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setRecentDestinations([]);
    } finally {
      setRecentLoading(false);
    }
  };

  // Delete saved trip
  const handleDeleteTrip = async (event, tripId) => {
    event.stopPropagation();

    try {
      await deleteTrip(tripId);

      setTrips((previousTrips) =>
        previousTrips.filter((trip) => trip._id !== tripId),
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Remove wishlist destination
  const handleRemoveWishlist = async (event, destinationId, wishlistItemId) => {
    event.stopPropagation();

    try {
      const userId = getLoggedInUserId();

      if (!userId) return;

      const response = await toggleWishlist(destinationId, userId);

      if (!response.data?.isWishlisted) {
        setWishlist((previousWishlist) =>
          previousWishlist.filter(
            (wishlistItem) => wishlistItem._id !== wishlistItemId,
          ),
        );
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Load dashboard data
  useEffect(() => {
    fetchTrips();
    fetchWishlist();
    fetchRecentDestinations();
  }, []);

  // Find the next upcoming trip
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fiveDaysLater = new Date(today);
  fiveDaysLater.setDate(today.getDate() + 5);

  // Only trips starting within the next 5 days
  const upcomingTrips = trips
    .filter((trip) => {
      if (!trip.startDate) return false;

      const startDate = new Date(trip.startDate);

      if (Number.isNaN(startDate.getTime())) {
        return false;
      }

      startDate.setHours(0, 0, 0, 0);

      return startDate > today && startDate <= fiveDaysLater;
    })
    .sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });

  // Nearest upcoming trip
  const upcomingTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  // Number of explored destinations
  const exploredCount = new Set([
    ...wishlist.map((item) => item?.destinationId?._id).filter(Boolean),

    ...recentDestinations
      .map((item) => item?.destinationId?._id)
      .filter(Boolean),
  ]).size;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Dashboard content */}
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-7">
          {/* Dashboard heading */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  TripPilot Dashboard
                </p>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
                  Welcome back, {username} 👋
                </h1>

                <p className="text-gray-500 mt-2">
                  Here's what's happening with your travels.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/plan-trip")}
                className="self-start md:self-center inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition"
              >
                <Plus size={19} />
                Plan New Trip
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {/* Total Trips */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Trips</p>

                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {trips.length}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Plane size={21} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* Wishlist */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Wishlist</p>

                  <p className="text-3xl font-bold text-emerald-500 mt-2">
                    {wishlist.length}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Heart size={21} className="text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Recently Viewed */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Recently Viewed</p>

                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {recentDestinations.length}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Clock3 size={21} className="text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Destinations Explored */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Destinations Explored</p>

                  <p className="text-3xl font-bold text-violet-600 mt-2">
                    {exploredCount}
                  </p>
                </div>

                <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center">
                  <MapPin size={21} className="text-violet-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Trip */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Upcoming Trip
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your next planned adventure.
                </p>
              </div>

              <Plane size={23} className="text-blue-600" />
            </div>

            {tripsLoading ? (
              <p className="text-gray-500">Loading trip...</p>
            ) : !upcomingTrip ? (
              <div className="rounded-xl bg-gray-50 p-8 text-center">
                <p className="text-gray-600">
                  No upcoming trip in the next 5 days.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/plan-trip")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Plan a Trip
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-white p-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="h-28 w-full sm:w-28 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Plane size={35} className="text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {upcomingTrip.destination}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {upcomingTrip.startDate} → {upcomingTrip.endDate}
                        </p>
                      </div>

                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                        Upcoming
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="bg-white border rounded-lg px-3 py-2 text-xs font-medium text-gray-600">
                        {upcomingTrip.travelers} Travelers
                      </span>

                      <span className="bg-white border rounded-lg px-3 py-2 text-xs font-medium text-gray-600">
                        {upcomingTrip.tripType}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/trip/${upcomingTrip._id}`)
                      }
                      className="mt-4 text-blue-600 text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Saved Trips */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Saved Trips
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your saved itineraries in one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/plan-trip")}
                className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1"
              >
                View All
                <ArrowRight size={15} />
              </button>
            </div>

            {tripsLoading ? (
              <p className="text-gray-500">Loading trips...</p>
            ) : trips.length === 0 ? (
              <div className="rounded-xl bg-gray-50 text-center py-12">
                <Plane size={35} className="mx-auto text-gray-400" />

                <p className="font-semibold text-gray-700 mt-3">
                  No saved trips yet.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/plan-trip")}
                  className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Generate Your First Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Show all saved trips */}
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    onClick={() => navigate(`/dashboard/trip/${trip._id}`)}
                    className="group border rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {trip.destination}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {trip.startDate} → {trip.endDate}
                        </p>
                      </div>

                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                        Saved
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">Budget</p>

                        <p className="font-bold text-gray-800 mt-1">
                          ₹{trip.budget}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">Travelers</p>

                        <p className="font-bold text-gray-800 mt-1">
                          {trip.travelers}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">Type</p>

                        <p className="font-bold text-gray-800 mt-1 truncate">
                          {trip.tripType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                      <span className="text-sm text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        View full itinerary
                        <ArrowRight size={15} />
                      </span>

                      <button
                        type="button"
                        onClick={(event) => handleDeleteTrip(event, trip._id)}
                        className="h-9 w-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                        title="Remove trip"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Wishlist */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  My Wishlist
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Destinations you saved for future trips.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/destinations")}
                className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1"
              >
                View All
                <ArrowRight size={15} />
              </button>
            </div>

            {wishlistLoading ? (
              <p className="text-gray-500">Loading saved destinations...</p>
            ) : wishlist.length === 0 ? (
              <div className="rounded-xl bg-gray-50 text-center py-12">
                <Heart size={35} className="mx-auto text-gray-400" />

                <p className="font-semibold text-gray-700 mt-3">
                  No destinations saved yet.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/destinations")}
                  className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Show all wishlist destinations */}
                {wishlist.map((wishlistItem) => {
                  const destination = wishlistItem?.destinationId;

                  if (!destination?._id) {
                    return null;
                  }

                  return (
                    <div
                      key={wishlistItem._id}
                      className="group border rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(`/destinations/${destination._id}`)
                        }
                      >
                        <div className="relative">
                          <img
                            src={
                              destination.image ||
                              "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
                            }
                            alt={destination.name}
                            className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                          />

                          <span className="absolute top-3 right-3 bg-white/95 rounded-full px-3 py-1 text-xs font-semibold text-red-500">
                            ♥ Saved
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">
                                {destination.name}
                              </h3>

                              <p className="text-xs text-blue-600 font-medium mt-1">
                                {destination.category || "Destination"}
                              </p>
                            </div>

                            <span className="text-xs font-semibold text-amber-600">
                              ⭐ {destination.rating || 0}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-3">
                            {destination.location || "Location not available"}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 pb-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/destinations/${destination._id}`)
                          }
                          className="text-blue-600 text-sm font-semibold"
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          onClick={(event) =>
                            handleRemoveWishlist(
                              event,
                              destination._id,
                              wishlistItem._id,
                            )
                          }
                          className="text-red-500 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recently Viewed */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recently Viewed Destinations
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Places you recently explored.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/destinations")}
                className="text-blue-600 font-semibold text-sm inline-flex items-center gap-1"
              >
                Explore More
                <ArrowRight size={15} />
              </button>
            </div>

            {recentLoading ? (
              <p className="text-gray-500">
                Loading recently viewed destinations...
              </p>
            ) : recentDestinations.length === 0 ? (
              <div className="rounded-xl bg-gray-50 text-center py-12">
                <Clock3 size={35} className="mx-auto text-gray-400" />

                <p className="font-semibold text-gray-700 mt-3">
                  No recently viewed destinations.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/destinations")}
                  className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Show latest 6 recently viewed destinations */}
                {recentDestinations.slice(0, 6).map((recentItem) => {
                  const destination = recentItem?.destinationId;

                  if (!destination?._id) {
                    return null;
                  }

                  return (
                    <div
                      key={recentItem._id}
                      onClick={() =>
                        navigate(`/destinations/${destination._id}`)
                      }
                      className="group border rounded-2xl overflow-hidden bg-white hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={
                            destination.image ||
                            "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
                          }
                          alt={destination.name}
                          className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                        />

                        <span className="absolute top-3 right-3 bg-slate-900/80 text-white rounded-full px-3 py-1 text-xs font-semibold">
                          Recently Viewed
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {destination.name}
                            </h3>

                            <p className="text-xs text-blue-600 font-medium mt-1">
                              {destination.category || "Destination"}
                            </p>
                          </div>

                          <span className="text-xs font-semibold text-amber-600">
                            ⭐ {destination.rating || 0}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-3">
                          {destination.location || "Location not available"}
                        </p>

                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {destination.description ||
                            "Explore this destination."}
                        </p>

                        <div className="mt-4 flex items-center justify-end">
                          <span className="text-blue-600 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Details
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
