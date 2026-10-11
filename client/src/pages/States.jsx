import { useEffect, useState } from "react";
import { getAllStates } from "../services/stateService";
import StateCard from "../components/state/StateCard";

function States() {
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await getAllStates();
        setStates(response.data);
      } catch (error) {
        console.error("Failed to fetch states:", error);
      }
    };

    fetchStates();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore States</h1>

        <p className="mt-2 text-base text-gray-600">
          Discover the beauty of Incredible India
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {states.map((state) => (
          <StateCard key={state._id} state={state} />
        ))}
      </div>
    </div>
  );
}

export default States;
