const CATEGORIES = [
  { value: "hills", label: "Hills & Mountains" },
  { value: "lakes", label: "Lakes" },
  { value: "waterfall", label: "Waterfalls" },
  { value: "beach", label: "Beaches" },
  { value: "adventure", label: "Adventure" },
  { value: "temple", label: "Temples & Religious" },
  { value: "historical", label: "Historical & Heritage" },
  { value: "wildlife", label: "Wildlife & Zoos" },
  { value: "nature", label: "Nature & Scenic" },
  { value: "culture", label: "Culture & Museums" },
  { value: "backwaters", label: "Backwaters & Islands" },
  { value: "city", label: "Cities & Towns" },
  { value: "other", label: "Other Attractions" },
];

function FilterBar({ filters, setFilters, handleClear }) {
  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div className="mb-6 flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:flex-row sm:flex-wrap sm:items-center">
      <select
        value={filters.category}
        onChange={(e) => updateFilter("category", e.target.value)}
        aria-label="Filter destinations by category"
        className="min-w-0 w-full rounded-xl border border-gray-200 bg-blue-50 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500 sm:flex-1"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>

      <select
        value={filters.rating}
        onChange={(e) => updateFilter("rating", e.target.value)}
        aria-label="Filter destinations by rating"
        className="w-full rounded-xl border border-gray-200 bg-orange-50 px-4 py-3 outline-none transition focus:ring-2 focus:ring-orange-400 sm:w-auto"
      >
        <option value="">All Ratings</option>
        <option value="4">4+ Rating</option>
        <option value="4.5">4.5+ Rating</option>
      </select>

      <button
        type="button"
        onClick={handleClear}
        className="w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 font-medium text-white shadow-sm transition hover:shadow-md sm:w-auto"
      >
        Clear
      </button>
    </div>
  );
}

export default FilterBar;
