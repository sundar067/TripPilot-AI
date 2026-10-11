import TripForm from "../components/trip/TripForm";

function PlanTrip() {
  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* Page Heading */}
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Plan Your Trip with AI
        </h1>

        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          Enter your trip details and TripPilot AI will help you generate a
          personalized itinerary.
        </p>
      </div>

      {/* Trip Form */}
      <div className="mx-auto max-w-4xl">
        <TripForm />
      </div>
    </div>
  );
}

export default PlanTrip;
