function AttractionCard({ attraction }) {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden">
      <img
        src={attraction.image}
        alt={attraction.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }}
      />

      <div className="p-4">
        <h2 className="text-xl font-bold">{attraction.name}</h2>

        <p className="text-gray-600 mt-2">{attraction.description}</p>

        <p className="mt-3">
          <span className="font-semibold">Price:</span> {attraction.price}
        </p>

        <p>
          <span className="font-semibold">Timing:</span> {attraction.timing}
        </p>

        <p>
          <span className="font-semibold">Rating:</span> ⭐ {attraction.rating}
        </p>
      </div>
    </div>
  );
}

export default AttractionCard;
