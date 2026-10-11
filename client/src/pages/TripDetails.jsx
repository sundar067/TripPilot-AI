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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600 text-lg">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600 text-lg">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-blue-600 font-semibold hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border p-8 mb-8">
          <p className="text-sm font-bold tracking-widest text-emerald-600 uppercase">
            Saved Trip Details
          </p>

          <h1 className="text-4xl font-extrabold text-gray-900 mt-2">
            {trip.destination} Trip
          </h1>

          <p className="text-gray-500 mt-2">
            {trip.startDate} → {trip.endDate}
          </p>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-2xl font-bold text-emerald-700">
                ₹{trip.budget}
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
              <p className="text-sm text-gray-500">Travelers</p>
              <p className="text-2xl font-bold text-sky-700">
                {trip.travelers}
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <p className="text-sm text-gray-500">Trip Type</p>
              <p className="text-2xl font-bold text-indigo-700">
                {trip.tripType}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-3xl shadow-2xl border border-white/10 p-8">
          <p className="text-sm text-emerald-300 mb-2">
            Powered by TripPilot AI Planning Engine
          </p>

          <h2 className="text-3xl font-bold mb-6">✨ Full AI Itinerary</h2>

          <pre className="whitespace-pre-wrap text-gray-100 leading-relaxed bg-white/10 border border-white/10 rounded-2xl p-6">
            {trip.generatedPlan}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
