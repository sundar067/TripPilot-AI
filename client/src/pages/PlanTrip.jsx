
import TripForm from "../components/trip/TripForm";

function PlanTrip() {
  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f8fafc] px-4 pb-10 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pt-10">
      {/* Page Heading */}
      <div className="mx-auto mb-8 w-full max-w-4xl text-center sm:mb-12">
        <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          Plan Your Trip with AI
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base md:text-lg">
          Enter your trip details and TripPilot AI will help you generate a
          personalized itinerary.
        </p>
      </div>

      {/* Trip Form */}
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <TripForm />
      </div>
    </div>
  );
}

export default PlanTrip;
