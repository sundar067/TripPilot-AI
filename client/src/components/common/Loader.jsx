function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative flex items-center justify-center w-44 h-44 rounded-full overflow-hidden">
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,#ffffff,#a855f7,#4f46e5,#111827,#ffffff)] animate-spin blur-sm"></div>

        <div className="absolute inset-3 rounded-full bg-black"></div>

        <div className="absolute inset-5 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),rgba(168,85,247,0.6),rgba(49,46,129,0.9),rgba(0,0,0,1))] animate-spin"></div>

        <span className="relative z-10 text-white text-xl font-light tracking-wide">
          TripPilot
        </span>
      </div>
    </div>
  );
}

export default Loader;
