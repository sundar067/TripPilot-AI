
import { useState } from "react";
import { Link } from "react-router-dom";

function DestinationCard({ destination }) {
  const [showMore, setShowMore] = useState(false);

  const description = destination.description || "";

  return (
    <Link
      to={`/destinations/${destination._id}`}
      className="block h-full w-full min-w-0"
    >
      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl sm:hover:scale-[1.02]">
        {/* Destination Image */}
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="h-44 w-full shrink-0 object-cover sm:h-48 md:h-52"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
          }}
        />

        {/* Destination Details */}
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          {/* Destination Name */}
          <h2 className="break-words text-lg font-bold leading-snug text-gray-900 sm:text-xl">
            {destination.name}
          </h2>

          {/* Category */}
          <p className="mt-1 break-words text-sm font-semibold text-blue-600">
            {destination.category}
          </p>

          {/* Description */}
          <div className="mt-3 min-w-0">
            <p className="break-words text-sm leading-relaxed text-gray-600 sm:text-base">
              {showMore ? (
                <>
                  {description}

                  <button
                    type="button"
                    className="ml-1 font-semibold text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMore(false);
                    }}
                  >
                    Show Less
                  </button>
                </>
              ) : (
                <>
                  {description.length > 150
                    ? `${description.slice(0, 150)}...`
                    : description}

                  {description.length > 150 && (
                    <button
                      type="button"
                      className="ml-1 font-semibold text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMore(true);
                      }}
                    >
                      Show More
                    </button>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Location */}
          <p className="mt-3 break-words text-sm leading-relaxed text-gray-700 sm:text-base">
            <span className="font-semibold">Location:</span>{" "}
            {destination.location}
          </p>

          {/* Famous For */}
          <p className="mt-2 break-words text-sm leading-relaxed text-gray-700 sm:text-base">
            <span className="font-semibold">Famous for:</span>{" "}
            {destination.famousFor}
          </p>

          {/* Best Time */}
          <p className="mt-2 break-words text-sm leading-relaxed text-gray-700 sm:text-base">
            <span className="font-semibold">Best Time:</span>{" "}
            {destination.bestTime}
          </p>

          {/* Rating */}
          <p className="mt-2 break-words text-sm leading-relaxed text-gray-700 sm:text-base">
            <span className="font-semibold">Rating:</span> ⭐{" "}
            {destination.rating}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default DestinationCard;
