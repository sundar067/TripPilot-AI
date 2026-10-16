function AttractionCard({ attraction }) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-lg border bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
      <img
        src={attraction.image}
        alt={attraction.name}
        className="h-44 w-full object-cover sm:h-48"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }}
      />

      <div className="min-w-0 p-3 sm:p-4">
        <h2 className="break-words text-lg font-bold leading-snug sm:text-xl">
          {attraction.name}
        </h2>

        <p className="mt-2 break-words text-sm leading-6 text-gray-600 sm:text-base">
          {attraction.description}
        </p>

        <div className="mt-3 space-y-2 text-sm sm:text-base">
          <p className="break-words">
            <span className="font-semibold">Price:</span>{" "}
            {attraction.price}
          </p>

          <p className="break-words">
            <span className="font-semibold">Timing:</span>{" "}
            {attraction.timing}
          </p>

          <p className="break-words">
            <span className="font-semibold">Rating:</span>{" "}
            ⭐ {attraction.rating}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AttractionCard;
