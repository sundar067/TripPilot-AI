import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getAttractionById } from "../services/attractionService";
import Loader from "../components/common/Loader";

function AttractionDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [attraction, setAttraction] = useState(null);

  useEffect(() => {
    fetchAttraction();
  }, [id]);

  const fetchAttraction = async () => {
    try {
      setLoading(true);

      const response = await getAttractionById(id);

      setAttraction(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load attraction");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!attraction) {
    return (
      <div className="text-center py-20 text-2xl font-bold">
        Attraction Not Found
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-16">
      {/* Hero Section */}

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <img
            src={attraction.image}
            alt={attraction.name}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      </div>

      {/* Content */}

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {attraction.name}
        </h1>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg">⭐</span>

          <span className="text-lg font-semibold text-yellow-500">
            {attraction.rating}
          </span>
        </div>

        {/* Description */}

        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-3">Description</h2>

          <p className="text-gray-700 leading-7">{attraction.description}</p>
        </div>

        {/* Information */}

        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-base font-bold mb-2">💰 Price</h3>

            <p className="text-gray-700">{attraction.price}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-base font-bold mb-2">🕒 Timing</h3>

            <p className="text-gray-700">{attraction.timing}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-base font-bold mb-2">📍 Destination</h3>

            <p className="text-gray-700">
              {attraction.destinationId?.name || "Unknown"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-base font-bold mb-2">⭐ Rating</h3>

            <p className="text-gray-700 font-semibold">{attraction.rating}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractionDetails;
