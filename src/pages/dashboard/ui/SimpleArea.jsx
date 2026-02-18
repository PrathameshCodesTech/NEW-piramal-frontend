export default function SimpleArea({ data, lineKeys = ["value1", "value2"], lineColors = ["#10b981", "#f59e0b"], fillOpacity = 0.25, height = 144 }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-40 text-gray-500">No data</div>;

  const maxVal = Math.max(1, ...data.flatMap((d) => lineKeys.map((k) => Number(d?.[k]) || 0)));
  const n = data.length || 1;
  const step = n > 1 ? 100 / (n - 1) : 100;
  const h = 80;
  const toY = (v) => h - (v / maxVal) * (h - 10);

  return (
    <div style={{ height }}>
      <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="w-full h-full">
        {lineKeys.map((key, ki) => {
          const coords = data.map((d, i) => `${i * step},${toY(Number(d?.[key]) || 0)}`);
          const lastX = (n - 1) * step;
          const areaPath = `M 0 ${h} L ${coords.join(" L ")} L ${lastX} ${h} Z`;
          const color = lineColors[ki] || "#10b981";
          return (
            <g key={ki}>
              <path d={areaPath} fill={color} fillOpacity={fillOpacity} />
              <path d={`M ${coords.join(" L ")}`} fill="none" stroke={color} strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
