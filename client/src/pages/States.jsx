
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
    <main className="w-full min-w-0 max-w-full overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Page Heading */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
          Explore States
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
          Discover the beauty of Incredible India
        </p>
      </div>

      {/* Responsive State Cards */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {states.map((state) => (
          <div key={state._id} className="min-w-0">
            <StateCard state={state} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default States;
