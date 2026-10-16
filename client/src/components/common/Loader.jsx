function Loader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-4">
      <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full sm:h-44 sm:w-44">
        <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_90deg,#ffffff,#a855f7,#4f46e5,#111827,#ffffff)] blur-sm"></div>

        <div className="absolute inset-3 rounded-full bg-black sm:inset-3"></div>

        <div className="absolute inset-5 animate-spin rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),rgba(168,85,247,0.6),rgba(49,46,129,0.9),rgba(0,0,0,1))]"></div>

        <span className="relative z-10 text-lg font-light tracking-wide text-white sm:text-xl">
          TripPilot
        </span>
      </div>
    </div>
  );
}

export default Loader;
