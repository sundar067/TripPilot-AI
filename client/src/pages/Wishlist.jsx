import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";

import { getUserWishlist, toggleWishlist } from "../services/wishlistService";
import Loader from "../components/common/Loader";

function Wishlist() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user ID
  const getLoggedInUserId = () => {
    const keys = ["user", "tripPilotUser", "authUser", "userInfo"];

    for (const key of keys) {
      const data = localStorage.getItem(key);

      if (!data) continue;

      try {
        const user = JSON.parse(data);

        const userId =
          user?._id || user?.id || user?.user?._id || user?.user?.id;

        if (userId) {
          return userId;
        }
      } catch (error) {
        console.log(error);
      }
    }

    return null;
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        setDestinations([]);
        return;
      }

      const response = await getUserWishlist(userId);

      /*
        Backend returns:

        [
          {
            _id: "...",
            userId: "...",
            destinationId: {
              _id: "...",
              name: "...",
              image: "...",
              location: "...",
              ...
            }
          }
        ]

        We only need destinationId for the cards.
      */

      const wishlistData = Array.isArray(response.data) ? response.data : [];

      const destinationList = wishlistData
        .map((item) => item?.destinationId)
        .filter((destination) => destination?._id);

      setDestinations(destinationList);
    } catch (error) {
      console.log(error.response?.data || error.message);

      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist when page opens
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove destination from wishlist
  const handleRemove = async (destinationId) => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) return;

      await toggleWishlist(destinationId, userId);

      // Remove from UI immediately
      setDestinations((previousDestinations) =>
        previousDestinations.filter(
          (destination) => destination._id !== destinationId,
        ),
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // Loading
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            My Wishlist
          </h1>

          <p className="mt-2 text-gray-600">
            Your saved destinations in one place.
          </p>
        </div>

        {/* Empty wishlist */}
        {destinations.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Heart size={30} className="text-red-500" fill="currentColor" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Save destinations you love and they will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/destinations")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Explore Destinations
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist count */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-500">
                {destinations.length}{" "}
                {destinations.length === 1 ? "destination" : "destinations"}{" "}
                saved
              </p>
            </div>

            {/* Wishlist cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {destinations.map((destination) => (
                <div
                  key={destination._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => navigate(`/destinations/${destination._id}`)}
                  >
                    <img
                      src={
                        destination.image ||
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                      }
                      alt={destination.name}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
                      }}
                    />

                    {/* Saved badge */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-500 shadow-sm">
                      <Heart size={13} fill="currentColor" />
                      Saved
                    </div>
                  </div>

                  {/* Destination details */}
                  <div className="p-5">
                    {/* Name + Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {destination.name}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-blue-600">
                          {destination.category || "Destination"}
                        </p>
                      </div>

                      <div className="whitespace-nowrap text-sm font-semibold text-amber-600">
                        ⭐ {destination.rating || 0}
                      </div>
                    </div>

                    {/* Location */}
                    <p className="mt-3 text-sm text-gray-500">
                      {destination.location || "Location not available"}
                    </p>

                    {/* Famous For */}
                    {destination.famousFor && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Famous for:</span>{" "}
                        {destination.famousFor}
                      </p>
                    )}

                    {/* Best Time */}
                    {destination.bestTime && (
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-semibold">Best Time:</span>{" "}
                        {destination.bestTime}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/destinations/${destination._id}`)
                        }
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:gap-2"
                      >
                        View Details
                        <ArrowRight size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(destination._id)}
                        className="text-sm font-semibold text-red-500 transition hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
