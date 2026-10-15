import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Search, Mic, MapPin, TrendingUp, X } from "lucide-react";

import { searchStates, searchDestinations } from "../../services/searchService";
import { logSearch } from "../../services/searchLogService";

import { getAnalytics } from "../../services/analyticsService";

function SearchBar() {
  const navigate = useNavigate();

  // Search Query

  const [query, setQuery] = useState("");

  // Suggestions

  const [results, setResults] = useState([]);

  // Voice Status

  const [isListening, setIsListening] = useState(false);

  // Trending

  const [trendingSearches, setTrendingSearches] = useState([]);

  // Fetch Trending Searches

  const fetchTrendingSearches = async () => {
    try {
      const data = await getAnalytics();

      setTrendingSearches(data.trendingSearches || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTrendingSearches();
  }, []);

  // Sort results so exact / closer matches to the query show first,
  // regardless of whether they're a state or a destination.

  const sortByRelevance = (items, value) => {
    const q = value.trim().toLowerCase();

    return [...items].sort((a, b) => {
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";

      const aExact = aName === q ? 0 : aName.startsWith(q) ? 1 : 2;
      const bExact = bName === q ? 0 : bName.startsWith(q) ? 1 : 2;

      if (aExact !== bExact) return aExact - bExact;

      return aName.localeCompare(bName);
    });
  };

  // Search Suggestions

  const handleSearch = async (e) => {
    const value = e.target.value;

    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const stateResponse = await searchStates(value, { track: false });

      const destinationResponse = await searchDestinations(value, {
        track: false,
      });

      const stateResults = stateResponse.data.map((state) => ({
        ...state,
        type: "state",
      }));

      const destinationResults = destinationResponse.data.map(
        (destination) => ({
          ...destination,
          type: "destination",
        }),
      );

      setResults(
        sortByRelevance([...destinationResults, ...stateResults], value),
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // When results include both a state and a destination, prefer whichever
  // one's name is an EXACT match to what the user typed (e.g. searching
  // "Goa" should open the Goa state page, not a destination that merely
  // has "Goa" in its location field).

  const pickBestMatch = (value, states, destinations) => {
    const q = value.trim().toLowerCase();

    const exactState = states.find((s) => s.name?.toLowerCase() === q);

    if (exactState) return { type: "state", item: exactState };

    const exactDestination = destinations.find(
      (d) => d.name?.toLowerCase() === q,
    );

    if (exactDestination) {
      return { type: "destination", item: exactDestination };
    }

    if (destinations.length > 0) {
      return { type: "destination", item: destinations[0] };
    }

    if (states.length > 0) {
      return { type: "state", item: states[0] };
    }

    return null;
  };

  // Final Search

  const handleFinalSearch = async () => {
    if (!query.trim()) return;

    try {
      const stateResponse = await searchStates(query);

      const destinationResponse = await searchDestinations(query);

      const best = pickBestMatch(
        query,
        stateResponse.data,
        destinationResponse.data,
      );

      if (best) {
        // Save valid search

        await logSearch(query);

        navigate(
          `/${best.type === "state" ? "states" : "destinations"}/${best.item._id}`,
        );

        setResults([]);

        return;
      }

      // Save missing search

      await logSearch(query);
    } catch (error) {
      console.log(error);
    }
  };

  // Clear Search

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
  };

  // Enter Key

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleFinalSearch();
    }
  };

  // Suggestion Click

  const handleResultClick = (result) => {
    if (result.type === "state") {
      navigate(`/states/${result._id}`);
    } else {
      navigate(`/destinations/${result._id}`);
    }

    setQuery("");

    setResults([]);
  };
  // Trending Search

  const handleTrendingClick = async (item) => {
    setQuery(item);

    try {
      const stateResponse = await searchStates(item);

      const destinationResponse = await searchDestinations(item);

      const best = pickBestMatch(
        item,
        stateResponse.data,
        destinationResponse.data,
      );

      if (best) {
        navigate(
          `/${best.type === "state" ? "states" : "destinations"}/${best.item._id}`,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Voice Search

  const startVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice Search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
        .replace(/[.,!?]+$/g, "")
        .trim();

      setQuery(transcript);

      setIsListening(false);

      try {
        const stateResponse = await searchStates(transcript);

        const destinationResponse = await searchDestinations(transcript);

        const best = pickBestMatch(
          transcript,
          stateResponse.data,
          destinationResponse.data,
        );

        if (best) {
          navigate(
            `/${best.type === "state" ? "states" : "destinations"}/${best.item._id}`,
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="w-full min-w-0 max-w-5xl">
      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-4">
        {/* Search */}

        <div className="relative flex-1">
          <div className="flex items-center rounded-full border border-gray-300 bg-white shadow-xl transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Search states, destinations, attractions..."
              className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-gray-400 sm:px-6 sm:py-5 sm:text-lg"
            />

            {query.trim() !== "" && (
              <button
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
                className="mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            )}

            <button
              onClick={handleFinalSearch}
              className="m-1 flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-sm font-semibold text-white transition hover:scale-105 sm:m-2 sm:gap-2 sm:px-8 sm:text-base"
            >
              <Search size={18} />
              Search
            </button>
          </div>

          {/* Suggestions */}

          {query.trim() !== "" && (
            <div className="absolute left-0 right-0 z-50 mt-4 max-h-96 overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl">
              {results.length > 0 ? (
                results.map((result) => (
                  <div
                    key={`${result.type}-${result._id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex cursor-pointer items-center gap-4 border-b border-gray-100 p-4 transition hover:bg-blue-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                      <MapPin size={18} className="text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {result.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {result.type === "state"
                          ? "State"
                          : `Tourist Place • ${result.category}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    No destination found
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Press Enter or click Search.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice */}

        <button
          onClick={startVoiceSearch}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white shadow-lg transition-all duration-300 hover:scale-110 sm:h-16 sm:w-16 ${
            isListening
              ? "animate-pulse border-red-500 bg-red-500 text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Mic size={26} />
        </button>
      </div>

      {/* Trending */}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-gray-600">
          <TrendingUp size={18} className="text-orange-500" />

          <span className="font-medium">Trending</span>
        </div>

        {trendingSearches.map((item) => (
          <button
            key={item._id || item.name}
            onClick={() => handleTrendingClick(item.name)}
            className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Voice Status */}

      {isListening && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-3 w-3 animate-ping rounded-full bg-red-500"></div>

          <span className="font-medium text-red-500">Listening...</span>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
