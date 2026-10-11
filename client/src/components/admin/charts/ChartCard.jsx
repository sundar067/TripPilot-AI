function ChartCard({ title, children }) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h3>
      </div>

      {/* Fixed chart area */}
      <div className="h-[300px] w-full overflow-hidden">{children}</div>
    </div>
  );
}

export default ChartCard;
