import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import toast from "react-hot-toast";

import {
  getAllDestinations,
  deleteDestination,
} from "../../services/destinationService";

import { X, Trash2 } from "lucide-react";

function ManageDestinations() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingSelected, setDeletingSelected] = useState(false);

  const inputRef = useRef(null);

  // fetch destinations
  const fetchDestinations = async () => {
    try {
      const response = await getAllDestinations();

      setDestinations(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error("Failed to fetch destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // filter destinations
  const filteredDestinations =
    search.trim() === ""
      ? destinations
      : destinations.filter((destination) => {
          const value = search.toLowerCase();

          return (
            destination.name?.toLowerCase().includes(value) ||
            destination.location?.toLowerCase().includes(value) ||
            destination.category?.toLowerCase().includes(value) ||
            destination.stateId?.name?.toLowerCase().includes(value)
          );
        });

  // suggestions
  const suggestions =
    search.trim() === "" ? [] : filteredDestinations.slice(0, 6);

  useEffect(() => {
    setActiveIndex(-1);
  }, [search]);

  // select suggestion
  const selectSuggestion = (destination) => {
    setSearch(destination.name);
    setShowSuggestions(false);
    setActiveIndex(-1);

    inputRef.current?.blur();
  };

  // run search
  const runSearch = () => {
    setShowSuggestions(false);
    setActiveIndex(-1);

    inputRef.current?.blur();
  };

  // keyboard search
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        runSearch();
      }

      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        runSearch();
      }
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  // select one
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }

      return [...prev, id];
    });
  };

  // select all
  const toggleSelectAll = () => {
    const filteredIds = filteredDestinations.map(
      (destination) => destination._id,
    );

    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const newIds = [...prev];

        filteredIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });

        return newIds;
      });
    }
  };

  // select all status
  const allFilteredSelected =
    filteredDestinations.length > 0 &&
    filteredDestinations.every((destination) =>
      selectedIds.includes(destination._id),
    );

  const someFilteredSelected = filteredDestinations.some((destination) =>
    selectedIds.includes(destination._id),
  );

  // delete one
  const handleDelete = async (id) => {
    const destination = destinations.find((item) => item._id === id);

    const result = await Swal.fire({
      title: "Delete Destination?",
      text: `"${destination?.name || "This destination"}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      focusCancel: true,
      borderRadius: "15px",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDestination(id);

      setDestinations((prev) =>
        prev.filter((destination) => destination._id !== id),
      );

      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));

      toast.success("Destination deleted successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(
        error.response?.data?.message || "Failed to delete destination",
      );
    }
  };

  // delete selected
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one destination");
      return;
    }

    const selectedDestinations = destinations.filter((destination) =>
      selectedIds.includes(destination._id),
    );

    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} Destinations?`,
      html: `
        <div style="font-size:14px;color:#64748b;">
          Selected destinations will be permanently deleted.
          <br/>
          <strong>This action cannot be undone.</strong>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete All",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      focusCancel: true,
      borderRadius: "15px",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingSelected(true);

      const results = await Promise.allSettled(
        selectedDestinations.map((destination) =>
          deleteDestination(destination._id),
        ),
      );

      const successfulIds = [];
      let failedCount = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulIds.push(selectedDestinations[index]._id);
        } else {
          failedCount++;

          console.log(
            `Failed to delete ${selectedDestinations[index].name}:`,
            result.reason?.response?.data || result.reason?.message,
          );
        }
      });

      setDestinations((prev) =>
        prev.filter((destination) => !successfulIds.includes(destination._id)),
      );

      setSelectedIds((prev) =>
        prev.filter((id) => !successfulIds.includes(id)),
      );

      if (failedCount === 0) {
        toast.success(
          `${successfulIds.length} destinations deleted successfully`,
        );
      } else if (successfulIds.length > 0) {
        toast.error(`${successfulIds.length} deleted, ${failedCount} failed`);
      } else {
        toast.error("Failed to delete selected destinations");
      }
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error("Failed to delete selected destinations");
    } finally {
      setDeletingSelected(false);
    }
  };

  // clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // loading
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />

          <p className="mt-4 text-lg font-medium text-slate-800">
            Loading Destinations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* header */}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage Destinations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search, edit and manage tourist destinations.
          </p>
        </div>

        <Link
          to="/admin/destinations/add"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Destination
        </Link>
      </div>

      {/* search */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search destination, state or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {suggestions.map((destination, index) => (
                  <button
                    key={destination._id}
                    type="button"
                    onMouseDown={() => selectSuggestion(destination)}
                    className={`flex w-full items-center gap-3 p-3 text-left transition ${
                      activeIndex === index ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {destination.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        📍 {destination.stateId?.name || "Unknown State"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={runSearch}
            className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <div className="mt-3 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredDestinations.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {destinations.length}
          </span>{" "}
          destinations
        </div>
      </div>

      {/* bulk actions */}

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <Trash2 size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {selectedIds.length} destination
                {selectedIds.length > 1 ? "s" : ""} selected
              </p>

              <p className="text-xs text-slate-500">
                Choose an action for selected destinations
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearSelection}
              disabled={deletingSelected}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={deletingSelected}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingSelected ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Selected
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* table */}

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
            </colgroup>

            {/* header */}

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 text-center sm:p-4">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate =
                          !allFilteredSelected && someFilteredSelected;
                      }
                    }}
                    onChange={toggleSelectAll}
                    disabled={filteredDestinations.length === 0}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>

                <th className="p-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Image
                </th>

                <th className="p-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Destination
                </th>

                <th className="p-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  State
                </th>

                <th className="p-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Category
                </th>

                <th className="p-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Media
                </th>

                <th className="p-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Nearby
                </th>

                <th className="p-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Rating
                </th>

                <th className="p-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:p-4 sm:text-xs">
                  Actions
                </th>
              </tr>
            </thead>

            {/* body */}

            <tbody>
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination) => {
                  const isSelected = selectedIds.includes(destination._id);

                  return (
                    <tr
                      key={destination._id}
                      className={`border-b border-slate-100 transition-colors last:border-b-0 ${
                        isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      {/* checkbox */}

                      <td className="p-3 text-center sm:p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(destination._id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* image */}

                      <td className="p-3 sm:p-4">
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="h-12 w-16 rounded-lg object-cover shadow-sm ring-1 ring-slate-200 sm:h-14 sm:w-20"
                        />
                      </td>

                      {/* destination */}

                      <td className="p-3 sm:p-4">
                        <p
                          className="truncate text-sm font-semibold text-slate-900 sm:text-base"
                          title={destination.name}
                        >
                          {destination.name}
                        </p>
                      </td>

                      {/* state */}

                      <td className="p-3 sm:p-4">
                        <p
                          className="truncate text-xs text-slate-600 sm:text-sm"
                          title={destination.stateId?.name}
                        >
                          {destination.stateId?.name || "N/A"}
                        </p>
                      </td>

                      {/* category */}

                      <td className="p-3 sm:p-4">
                        <span
                          className="block truncate rounded-full bg-blue-50 px-2.5 py-1 text-center text-[10px] font-semibold text-blue-700 sm:px-3 sm:text-xs"
                          title={destination.category}
                        >
                          {destination.category || "N/A"}
                        </span>
                      </td>

                      {/* media */}

                      <td className="p-3 text-xs text-slate-600 sm:p-4 sm:text-sm">
                        <div className="space-y-1">
                          <p className="whitespace-nowrap">
                            🖼 <span className="hidden sm:inline">Photos:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {destination.galleryImages?.length || 0}
                            </span>
                          </p>

                          <p className="whitespace-nowrap">
                            🎥 <span className="hidden sm:inline">Videos:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {destination.shortVideos?.length || 0}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* nearby */}

                      <td className="p-3 text-center text-xs text-slate-600 sm:p-4 sm:text-sm">
                        <span className="font-semibold text-slate-800">
                          📍 {destination.nearbyPlaces?.length || 0}
                        </span>
                      </td>

                      {/* rating */}

                      <td className="p-3 text-center sm:p-4">
                        <span className="whitespace-nowrap text-xs font-semibold text-amber-600 sm:text-sm">
                          ⭐ {destination.rating ?? "N/A"}
                        </span>
                      </td>

                      {/* actions */}

                      <td className="p-3 sm:p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/destinations/edit/${destination._id}`,
                              )
                            }
                            disabled={deletingSelected}
                            className="rounded-lg bg-amber-500 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-sm"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(destination._id)}
                            disabled={deletingSelected}
                            className="rounded-lg bg-red-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <p className="text-base font-semibold text-slate-700">
                      No destinations found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try another search or add a new destination.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* total */}

      <div className="flex items-center justify-between pb-4 text-sm text-slate-500">
        <span>
          Total Destinations:{" "}
          <span className="font-semibold text-slate-800">
            {destinations.length}
          </span>
        </span>

        {selectedIds.length > 0 && (
          <span className="font-medium text-blue-600">
            {selectedIds.length} selected
          </span>
        )}
      </div>
    </div>
  );
}

export default ManageDestinations;
