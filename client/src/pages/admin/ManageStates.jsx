import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import { getAllStates, deleteState } from "../../services/stateService";

function ManageStates() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All States
  const fetchStates = async () => {
    try {
      const response = await getAllStates();

      setStates(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error("Failed to fetch states");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Delete State
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete State?",
      text: "You won't be able to recover this state!",
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
      await deleteState(id);

      setStates((prevStates) => prevStates.filter((state) => state._id !== id));

      toast.success("State Deleted Successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Failed to delete state");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Simple Admin Loader */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

          {/* Loading Text */}
          <p className="mt-4 text-lg font-medium text-slate-800">
            Loading States...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage States</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all Indian states and their information.
          </p>
        </div>

        <Link
          to="/admin/states/add"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
        >
          + Add State
        </Link>
      </div>

      {/* States Table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            {/* Table Header */}

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Image
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  State
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Description
                </th>

                <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}

            <tbody>
              {states.length > 0 ? (
                states.map((state) => (
                  <tr
                    key={state._id}
                    className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                  >
                    {/* Image */}

                    <td className="p-4">
                      <img
                        src={state.image}
                        alt={state.name}
                        className="h-16 w-24 rounded-lg object-cover shadow-sm ring-1 ring-slate-200"
                      />
                    </td>

                    {/* State */}

                    <td className="p-4">
                      <p className="font-semibold text-slate-900">
                        {state.name}
                      </p>
                    </td>

                    {/* Description */}

                    <td className="max-w-xl p-4">
                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                        {state.description}
                      </p>
                    </td>

                    {/* Actions */}

                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        {/* Edit */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/states/edit/${state._id}`)
                          }
                          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md"
                        >
                          Edit
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() => handleDelete(state._id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <p className="text-base font-semibold text-slate-700">
                      No states found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add a state to see it here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total States */}

      <div className="text-sm text-slate-500">
        Total States:{" "}
        <span className="font-semibold text-slate-800">{states.length}</span>
      </div>
    </div>
  );
}

export default ManageStates;
