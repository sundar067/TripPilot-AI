import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Plus,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { getAllDestinations } from "../../services/destinationService";

import {
  getAttractionsByDestination,
  deleteAttraction,
} from "../../services/attractionService";

function ManageAttractions() {
  const navigate = useNavigate();

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------

  const [destinations, setDestinations] = useState([]);

  const [selectedDestination, setSelectedDestination] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [attractions, setAttractions] = useState([]);

  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);

  // --------------------------------------------------
  // FETCH DESTINATIONS
  // --------------------------------------------------

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await getAllDestinations();

      setDestinations(response.data || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load destinations");
    }
  };

  // --------------------------------------------------
  // CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------------------------------------------
  // FILTER DESTINATIONS
  // --------------------------------------------------

  const filteredDestinations = destinations.filter((destination) =>
    destination.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  // --------------------------------------------------
  // LOAD ATTRACTIONS
  // --------------------------------------------------

  const loadAttractions = async (destinationId) => {
    if (!destinationId) {
      setAttractions([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getAttractionsByDestination(destinationId);

      setAttractions(response.data || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load attractions");

      setAttractions([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SELECT DESTINATION
  // --------------------------------------------------

  const handleSelectDestination = async (destination) => {
    if (!destination) return;

    setSelectedDestination(destination._id);

    setSearchQuery(destination.name || "");

    setShowSuggestions(false);

    await loadAttractions(destination._id);
  };

  // --------------------------------------------------
  // SEARCH DESTINATION
  // --------------------------------------------------

  const handleSearch = async () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      toast.error("Please enter a destination name");
      setShowSuggestions(true);
      return;
    }

    // Exact match first
    let destination = destinations.find(
      (item) => item.name?.toLowerCase() === query,
    );

    // Then starts-with match
    if (!destination) {
      destination = destinations.find((item) =>
        item.name?.toLowerCase().startsWith(query),
      );
    }

    // Then partial match
    if (!destination) {
      destination = destinations.find((item) =>
        item.name?.toLowerCase().includes(query),
      );
    }

    if (!destination) {
      toast.error("Destination not found");
      setSelectedDestination("");
      setAttractions([]);
      setShowSuggestions(true);
      return;
    }

    await handleSelectDestination(destination);
  };

  // --------------------------------------------------
  // ENTER KEY SEARCH
  // --------------------------------------------------

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      await handleSearch();
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // --------------------------------------------------
  // CLEAR SEARCH
  // --------------------------------------------------

  const handleClearSearch = () => {
    setSearchQuery("");

    setSelectedDestination("");

    setAttractions([]);

    setShowSuggestions(false);
  };

  // --------------------------------------------------
  // DELETE ATTRACTION
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attraction?",
    );

    if (!confirmDelete) return;

    try {
      await deleteAttraction(id);

      toast.success("Attraction deleted successfully");

      if (selectedDestination) {
        await loadAttractions(selectedDestination);
      }
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete attraction");
    }
  };

  // --------------------------------------------------
  // SELECTED DESTINATION DATA
  // --------------------------------------------------

  const selectedDestinationData = destinations.find(
    (destination) => destination._id === selectedDestination,
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Manage Attractions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage tourist attractions for your destinations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/attractions/add")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
        >
          <Plus size={18} />
          Add Attraction
        </button>
      </div>

      {/* ================================================
          SEARCH DESTINATION
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Search heading */}

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MapPin size={19} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Select Destination
            </h2>

            <p className="text-sm text-slate-500">
              Search a destination to view its attractions.
            </p>
          </div>
        </div>

        {/* Search input + button */}

        <div ref={searchRef} className="relative">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Input */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);

                  setSelectedDestination("");

                  setAttractions([]);

                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search destination..."
                autoComplete="off"
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              {/* Clear button */}

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* Search button */}

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              <Search size={17} />
              Search
            </button>
          </div>

          {/* ================================================
              AUTOCOMPLETE SUGGESTIONS
          ================================================= */}

          {showSuggestions && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {filteredDestinations.length > 0 ? (
                <>
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Destinations
                    </p>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {filteredDestinations.slice(0, 10).map((destination) => (
                      <button
                        key={destination._id}
                        type="button"
                        onClick={() => handleSelectDestination(destination)}
                        className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <MapPin size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {destination.name}
                          </p>

                          {destination.state && (
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {typeof destination.state === "object"
                                ? destination.state.name
                                : destination.state}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="px-5 py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Search size={19} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No destinations found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try searching with another destination name.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected destination info */}

        {selectedDestination && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-blue-600" />

              <span className="text-sm font-semibold text-blue-900">
                {selectedDestinationData?.name || "Selected Destination"}
              </span>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
              {attractions.length}{" "}
              {attractions.length === 1 ? "Attraction" : "Attractions"}
            </span>
          </div>
        )}
      </div>

      {/* ================================================
          CONTENT
      ================================================= */}

      {loading ? (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center">
            {/* Simple Admin Loader */}

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

            <p className="mt-4 text-lg font-medium text-slate-800">
              Loading...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ================================================
              NO DESTINATION SELECTED
          ================================================= */}

          {!selectedDestination && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <MapPin size={28} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                Select a destination
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Search and select a destination above to view and manage its
                tourist attractions.
              </p>
            </div>
          )}

          {/* ================================================
              DESTINATION SELECTED BUT NO ATTRACTIONS
          ================================================= */}

          {selectedDestination && attractions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Sparkles size={28} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No attractions found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no attractions added for this destination yet.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/attractions/add")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Add Attraction
              </button>
            </div>
          )}

          {/* ================================================
              ATTRACTIONS GRID
          ================================================= */}

          {attractions.length > 0 && (
            <div>
              {/* Section Header */}

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Attractions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {attractions.length} attractions available
                  </p>
                </div>
              </div>

              {/* Cards */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {attractions.map((attraction) => (
                  <div
                    key={attraction._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    {/* Image */}

                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* Rating */}

                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-800 shadow-sm backdrop-blur">
                        <Star
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />

                        {attraction.rating ?? "N/A"}
                      </div>
                    </div>

                    {/* Content */}

                    <div className="p-5">
                      <h2 className="line-clamp-1 text-xl font-bold text-slate-900">
                        {attraction.name}
                      </h2>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                        {attraction.description
                          ? `${attraction.description.slice(0, 100)}${
                              attraction.description.length > 100 ? "..." : ""
                            }`
                          : "No description available."}
                      </p>

                      {/* Details */}

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                        {/* Price */}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-500">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                              <IndianRupee size={15} />
                            </div>

                            <span className="text-sm">Price</span>
                          </div>

                          <span className="text-sm font-semibold text-slate-800">
                            {attraction.price || "Free"}
                          </span>
                        </div>

                        {/* Timing */}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-500">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Clock size={15} />
                            </div>

                            <span className="text-sm">Timing</span>
                          </div>

                          <span className="max-w-[160px] truncate text-right text-sm font-semibold text-slate-800">
                            {attraction.timing || "Not specified"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {/* Edit */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/attractions/edit/${attraction._id}`,
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() => handleDelete(attraction._id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ManageAttractions;
