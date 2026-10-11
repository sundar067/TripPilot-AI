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
    <div className="p-8">
      <img
        src={state.image}
        alt={state.name}
        className="w-full h-96 object-cover rounded-lg"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
        }}
      />

      <h1 className="text-4xl font-bold mt-6">{state.name}</h1>

      <p className="text-gray-700 mt-4 text-lg">{state.description}</p>

      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-6">
          Best Places to Visit in {state.name}
        </h2>

        {destinations.length === 0 ? (
          <p className="text-gray-600">No tourist places added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination._id}
                destination={destination}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StateDetails;
