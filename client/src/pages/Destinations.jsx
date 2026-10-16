
import { useEffect, useState } from "react";

import { getAllDestinations } from "../services/destinationService";
import { filterDestinations } from "../services/searchService";

import DestinationCard from "../components/destination/DestinationCard";
import FilterBar from "../components/filter/FilterBar";
import Loader from "../components/common/Loader";

function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    rating: "",
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [filters]);

  const fetchDestinations = async () => {
    try {
      const response = await getAllDestinations();
      setDestinations(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      const isFilterEmpty = !filters.category && !filters.rating;

      if (isFilterEmpty) {
        fetchDestinations();
        return;
      }

      setLoading(true);
      const response = await filterDestinations(filters);
      setDestinations(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({
      category: "",
      rating: "",
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
          Explore Destinations
        </h1>

        <p className="max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
          Discover tourist places across India using smart filters.
        </p>
      </div>

      <div className="mb-6 min-w-0 sm:mb-8">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          handleClear={handleClear}
        />
      </div>

      {destinations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center sm:px-6">
          <p className="text-sm text-gray-600 sm:text-base">
            No destinations found.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination._id}
              destination={destination}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Destinations;
