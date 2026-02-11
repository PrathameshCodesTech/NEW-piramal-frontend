export default function AreaCard({ label, total, allocated, remaining, unit = "sqft" }) {
  const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <p className="text-lg font-semibold text-gray-800">
        {total?.toLocaleString() ?? "—"} <span className="text-xs text-gray-400">{unit}</span>
      </p>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs">
        <span className="text-emerald-600">
          Allocated: {allocated?.toLocaleString() ?? "0"} ({pct}%)
        </span>
        <span className="text-amber-600">
          Remaining: {remaining?.toLocaleString() ?? "0"}
        </span>
      </div>
    </div>
  );
}
