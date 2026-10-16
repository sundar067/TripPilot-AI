
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
    <div className="mb-6 flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-md sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4">
      <select
        value={filters.category}
        onChange={(e) => updateFilter("category", e.target.value)}
        aria-label="Filter destinations by category"
        className="box-border min-h-12 w-full min-w-0 appearance-auto rounded-xl border border-gray-200 bg-blue-50 px-3 py-3 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500 sm:w-auto sm:flex-1 sm:px-4 sm:text-base"
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
        className="box-border min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-orange-50 px-3 py-3 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-orange-400 sm:w-auto sm:px-4 sm:text-base"
      >
        <option value="">All Ratings</option>
        <option value="4">4+ Rating</option>
        <option value="4.5">4.5+ Rating</option>
      </select>

      <button
        type="button"
        onClick={handleClear}
        className="min-h-12 w-full shrink-0 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:shadow-md active:scale-[0.99] sm:w-auto sm:px-6 sm:text-base sm:active:scale-100"
      >
        Clear
      </button>
    </div>
  );
}

export default FilterBar;
