export default function SimpleBar({ data, barColors = ["#10b981", "#f59e0b"], barKeys = ["value1", "value2"], labels, height = 220, formatValue }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-gray-500">No data</div>;

  const max = Math.max(1, ...data.flatMap((d) => barKeys.map((k) => Number(d?.[k]) || 0)));

  return (
    <div className="flex items-end justify-around gap-4 w-full px-4" style={{ minHeight: height + 60 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="flex items-end justify-center gap-1" style={{ height }}>
            {barKeys.map((k, ki) => {
              const val = Number(d?.[k]) || 0;
              const h = (val / max) * (height - 20);
              return (
                <div key={ki} className="flex flex-col items-center">
                  <span className="text-xs font-semibold mb-1" style={{ color: barColors[ki] }}>
                    {formatValue ? formatValue(val) : val}
                  </span>
                  <div
                    className="rounded-t-lg"
                    style={{ width: 44, height: Math.max(8, h), backgroundColor: barColors[ki] }}
                  />
                </div>
              );
            })}
          </div>
          <span className="text-sm font-semibold text-gray-800 text-center leading-tight">{d.label || labels?.[i] || ""}</span>
        </div>
      ))}
    </div>
  );
}
