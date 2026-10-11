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
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Explore Destinations</h1>

      <p className="text-gray-600 mb-8">
        Discover tourist places across India using smart filters.
      </p>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        handleClear={handleClear}
      />

      {destinations.length === 0 ? (
        <p className="text-gray-600">No destinations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <DestinationCard key={destination._id} destination={destination} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Destinations;
