import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTripById } from "../services/tripService";

function TripDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTripDetails = async () => {
    try {
      const response = await getTripById(id);
      setTrip(response.data.trip);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Failed to load trip details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-center text-base sm:text-lg text-gray-600">
          Loading trip details...
        </p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-center text-base sm:text-lg text-gray-600">
          Trip not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-3 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-4 inline-flex items-center gap-2 rounded-md py-2 text-sm font-semibold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 sm:mb-6 sm:text-base"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Dashboard</span>
        </button>

        {/* Trip Summary */}
        <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:mb-8 sm:rounded-3xl sm:p-6 sm:shadow-xl lg:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 sm:text-sm">
            Saved Trip Details
          </p>

          <h1 className="mt-2 break-words text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {trip.destination} Trip
          </h1>

          <p className="mt-3 break-words text-sm text-gray-500 sm:text-base">
            {trip.startDate} <span className="mx-1">→</span> {trip.endDate}
          </p>

          {/* Trip Information Cards */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-5">
            {/* Budget */}
            <div className="min-w-0 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:rounded-2xl sm:p-5">
              <p className="text-xs text-gray-500 sm:text-sm">
                Budget
              </p>

              <p className="mt-1 break-words text-xl font-bold text-emerald-700 sm:text-2xl">
                ₹{trip.budget}
              </p>
            </div>

            {/* Travelers */}
            <div className="min-w-0 rounded-xl border border-sky-100 bg-sky-50 p-4 sm:rounded-2xl sm:p-5">
              <p className="text-xs text-gray-500 sm:text-sm">
                Travelers
              </p>

              <p className="mt-1 break-words text-xl font-bold text-sky-700 sm:text-2xl">
                {trip.travelers}
              </p>
            </div>

            {/* Trip Type */}
            <div className="min-w-0 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:rounded-2xl sm:p-5">
              <p className="text-xs text-gray-500 sm:text-sm">
                Trip Type
              </p>

              <p className="mt-1 break-words text-xl font-bold text-indigo-700 sm:text-2xl">
                {trip.tripType}
              </p>
            </div>
          </div>
        </div>

        {/* AI Itinerary */}
        <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-xl sm:rounded-3xl sm:p-6 sm:shadow-2xl lg:p-8">
          <p className="mb-2 text-xs text-emerald-300 sm:text-sm">
            Powered by TripPilot AI Planning Engine
          </p>

          <h2 className="mb-4 text-xl font-bold leading-snug sm:mb-6 sm:text-2xl lg:text-3xl">
            <span aria-hidden="true">✨ </span>
            Full AI Itinerary
          </h2>

          <pre className="w-full min-w-0 max-w-full overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-xl border border-white/10 bg-white/10 p-3 text-sm leading-relaxed text-gray-100 sm:rounded-2xl sm:p-5 sm:text-base lg:p-6">
            {trip.generatedPlan}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
