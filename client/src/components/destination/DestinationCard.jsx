import { useState } from "react";
import { Link } from "react-router-dom";

function DestinationCard({ destination }) {
  const [showMore, setShowMore] = useState(false);

  const description = destination.description || "";

  return (
    <Link to={`/destinations/${destination._id}`}>
      <div className="border rounded-lg shadow-md overflow-hidden hover:scale-105 transition h-full">
        {/* Destination image */}
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
          }}
        />

        <div className="p-4">
          {/* Destination name */}
          <h2 className="text-xl font-bold">{destination.name}</h2>

          {/* Category */}
          <p className="text-sm text-blue-600 font-semibold mt-1">
            {destination.category}
          </p>

          {/* Description */}
          <div className="mt-2">
            <p className="text-gray-600">
              {showMore ? (
                <>
                  {description}

                  {/* Show Less */}
                  <button
                    type="button"
                    className="text-blue-600 font-semibold text-sm hover:underline"
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

                  {/* Show More */}
                  {description.length > 150 && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="text-blue-600 font-semibold text-sm hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMore(true);
                        }}
                      >
                        Show More
                      </button>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Location */}
          <p className="mt-2">
            <span className="font-semibold">Location:</span>{" "}
            {destination.location}
          </p>

          {/* Famous For */}
          <p className="mt-2">
            <span className="font-semibold">Famous for:</span>{" "}
            {destination.famousFor}
          </p>

          {/* Best Time */}
          <p className="mt-1">
            <span className="font-semibold">Best Time:</span>{" "}
            {destination.bestTime}
          </p>

          {/* Rating */}
          <p className="mt-1">
            <span className="font-semibold">Rating:</span> ⭐{" "}
            {destination.rating}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default DestinationCard;
