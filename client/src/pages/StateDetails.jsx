
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getStateById } from "../services/stateService";
import { getDestinationsByState } from "../services/destinationService";

import DestinationCard from "../components/destination/DestinationCard";
import Loader from "../components/common/Loader";

function StateDetails() {
  const [state, setState] = useState(null);
  const [destinations, setDestinations] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    fetchStateDetails();
    fetchStateDestinations();
  }, [id]);

  const fetchStateDetails = async () => {
    try {
      const response = await getStateById(id);
      setState(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchStateDestinations = async () => {
    try {
      const response = await getDestinationsByState(id);
      setDestinations(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  if (!state) {
    return <Loader />;
  }

  return (
    <main className="w-full min-w-0 max-w-full overflow-x-clip px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      {/* State Image */}
      <img
        src={state.image}
        alt={state.name}
        className="h-56 w-full rounded-xl object-cover sm:h-72 md:h-80 lg:h-96"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }}
      />

      {/* State Information */}
      <h1 className="mt-5 break-words text-2xl font-bold leading-tight text-gray-900 sm:mt-6 sm:text-3xl lg:text-4xl">
        {state.name}
      </h1>

      <p className="mt-3 break-words text-base leading-relaxed text-gray-700 sm:mt-4 sm:text-lg">
        {state.description}
      </p>

      {/* Destinations */}
      <section className="mt-8 min-w-0 sm:mt-10">
        <h2 className="mb-5 break-words text-2xl font-bold leading-snug text-gray-900 sm:mb-6 sm:text-3xl">
          Best Places to Visit in {state.name}
        </h2>

        {destinations.length === 0 ? (
          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
            No tourist places added yet.
          </p>
        ) : (
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {destinations.map((destination) => (
              <div key={destination._id} className="min-w-0">
                <DestinationCard destination={destination} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default StateDetails;
