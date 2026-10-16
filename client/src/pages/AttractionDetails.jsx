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
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 text-center text-xl font-bold sm:text-2xl">
        Attraction Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-100 pb-10 sm:pb-16">
      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-3 pt-5 sm:px-6 sm:pt-8">
        <div className="overflow-hidden rounded-xl shadow-xl sm:rounded-2xl">
          <img
            src={attraction.image}
            alt={attraction.name}
            className="h-52 w-full object-cover sm:h-64 md:h-80"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-5 max-w-5xl px-3 sm:mt-8 sm:px-6">
        <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
          {attraction.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-lg">⭐</span>

          <span className="text-base font-semibold text-yellow-500 sm:text-lg">
            {attraction.rating}
          </span>
        </div>

        {/* Description */}
        <div className="mt-5 rounded-xl bg-white p-4 shadow sm:mt-6 sm:p-6">
          <h2 className="mb-3 text-lg font-bold sm:text-xl">
            Description
          </h2>

          <p className="break-words text-sm leading-7 text-gray-700 sm:text-base">
            {attraction.description}
          </p>
        </div>

        {/* Information */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
          <div className="min-w-0 rounded-xl bg-white p-4 shadow sm:p-5">
            <h3 className="mb-2 text-base font-bold">
              💰 Price
            </h3>

            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              {attraction.price}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white p-4 shadow sm:p-5">
            <h3 className="mb-2 text-base font-bold">
              🕒 Timing
            </h3>

            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              {attraction.timing}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white p-4 shadow sm:p-5">
            <h3 className="mb-2 text-base font-bold">
              📍 Destination
            </h3>

            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              {attraction.destinationId?.name || "Unknown"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white p-4 shadow sm:p-5">
            <h3 className="mb-2 text-base font-bold">
              ⭐ Rating
            </h3>

            <p className="break-words text-sm font-semibold leading-6 text-gray-700 sm:text-base">
              {attraction.rating}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractionDetails;
